import { input } from "@inquirer/prompts";
import { memoryService } from "./services/memory.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { responseSchema } from "./services/response_format.js";
import { fileSystemFunctions, executeCommand } from "./skills/file_system.js";
import dotenv from "dotenv";

dotenv.config();

const SOUL = fs.readFileSync("SOUL.md", "utf8");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

// Gemini does not allow responseMimeType: "application/json" when tools are present.
// So we ask the model to put response/memory in a JSON line and parse it from text.
function parseResponseAndMemory(raw) {
    if (!raw || !raw.trim()) return { response: null, memory: null };
    const trimmed = raw.trim();
    // Try full text as JSON
    try {
        const data = JSON.parse(trimmed);
        const parsed = responseSchema.safeParse({ ...data, memory: data.memory ?? "" });
        return parsed.success ? { response: parsed.data.response, memory: parsed.data.memory } : { response: null, memory: null };
    } catch (_) {}
    // Try last line as JSON (prompt asks for single-line JSON)
    const lastLine = trimmed.split("\n").pop()?.trim();
    if (lastLine) {
        try {
            const data = JSON.parse(lastLine);
            const parsed = responseSchema.safeParse({ ...data, memory: data.memory ?? "" });
            return parsed.success ? { response: parsed.data.response, memory: parsed.data.memory } : { response: null, memory: null };
        } catch (_) {}
    }
    // Fallback: treat whole text as response
    return { response: trimmed, memory: "" };
}

const generateResponse = async (contents) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
        config: {
            systemInstruction: SOUL,
            tools: [{ functionDeclarations: [...fileSystemFunctions] }],
        },
    });

    const functionCalls = response.functionCalls;
    const raw = response.text;
    const { response: text, memory } = raw ? parseResponseAndMemory(raw) : { response: null, memory: null };

    if (memory != null) memoryService.add("assistantMemory", memory);
    if (text != null) memoryService.add("assistantResponse", text);

    return { text, memory, functionCalls };
};

while (true) {
    const answer = await input({
        message: "Type here...",
    });

    memoryService.add("userMessage", answer);
    const response = await generateResponse([
        `
            You are given the following conversation history:
            ${memoryService.getHistory()}

            The user has asked: ${answer}

            When replying with text (not calling a tool), respond with exactly one line of valid JSON: {"response": "<your reply>", "memory": "<what to remember or empty string>"}. No markdown, no code fences.
        `
    ]);

    let text = response.text;
    console.log(response);
    if (response.functionCalls) {
        let newCommand = response.functionCalls[0];
        do {
            console.log('inside function calls', newCommand.name, newCommand.args);
            const result = executeCommand(newCommand.name, newCommand.args);
            console.log('result', result);
            const newResponse = await generateResponse([
                `
                    You are given the following conversation history:
                    ${memoryService.getHistory()}

                    You are currently executing the following tool: ${newCommand.name} with the following arguments: ${JSON.stringify(newCommand.arguments)}
                    The result of the tool execution is: ${result}
                    When replying with text (not calling a tool), respond with exactly one line of valid JSON: {"response": "<your reply>", "memory": "<what to remember or empty string>"}. No markdown, no code fences.
                `
            ]);
            


            if (newResponse.functionCalls) {
                newCommand = newResponse.functionCalls[0];
            } else {
                newCommand = null;
                text = newResponse.text;
            }

        } while (newCommand);
    }

    if (text != null) console.log(text);
}