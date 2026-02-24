import fs from 'fs';

// Use parametersJsonSchema (JSON Schema) so the API gets type: "object" at the root.
// The Gemini API rejects parameters.properties/required unless root has type OBJECT.
export const fileSystemFunctions = [
    {
        name: "read_file",
        description: "Read a file from the filesystem",
        parametersJsonSchema: {
            type: "object",
            properties: {
                path: { type: "string", description: "Path to the file" },
            },
            required: ["path"],
            additionalProperties: false,
        },
    },
    {
        name: "list_files",
        description: "List all files in a directory",
        parametersJsonSchema: {
            type: "object",
            properties: {
                path: { type: "string", description: "Path to the directory" },
            },
            required: ["path"],
            additionalProperties: false,
        },
    },
    {
        name: "present_directory",
        description: "Present the current directory",
        parametersJsonSchema: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
        },
    },
    // {
    //     name: "write_file",
    //     description: "Write content to a file",
    //     parameters: {
    //         type: "object",
    //         properties: {
    //             "path": {type: "string", description: "Path to the file"},
    //             "content": {type: "string", description: "Content to write"}
    //         },
    //         required: ["path", "content"]
    //     }
    // },
    // {
    //     name: "web_search",
    //     description: "Search the web for information",
    //     parameters: {
    //         type: "object",
    //         properties: {
    //             "query": {type: "string", description: "Search query"}
    //         },
    //         required: ["query"]
    //     }
    // }
]

export const executeCommand = (name, input) => {
    if (name === "read_file") {
        return fs.readFileSync(input.path, "utf8");
    } else if (name === "list_files") {
        return fs.readdirSync(input.path);
    } else if (name === "present_directory") {
        return `Current directory: ${process.cwd()}`;
    } else {
        return "Command not found";
    }
}