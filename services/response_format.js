import { z } from "zod";

export const responseSchema = z.object({
    response: z.string(),
    memory: z.string(),
});

// Inline JSON schema: Gemini works best with type/properties/required (no $ref).
// Zod 4's z.toJSONSchema() is an alternative; inline avoids any conversion quirks.
export const responseJsonSchema = {
    type: "object",
    properties: {
        response: { type: "string", description: "Your reply to the user" },
        memory: { type: "string", description: "Anything to remember for future turns" }
    },
    required: ["response"],
    additionalProperties: false,
};