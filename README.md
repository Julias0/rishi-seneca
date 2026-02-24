# Rishi Seneca

A CLI chatbot that speaks as **Seneca the Younger**—Stoic philosopher and developer—powered by Google Gemini. Chat in your terminal with conversation memory and optional file-system tools (read files, list directories).

## Features

- **Stoic persona** — Replies are guided by a system prompt in `SOUL.md`: concise, opinionated, and developer-savvy.
- **Conversation memory** — Recent messages and “what to remember” are persisted to `memory.txt` and reused in context.
- **Tool use** — The model can call:
  - `read_file` — read a file by path
  - `list_files` — list entries in a directory
  - `present_directory` — show current working directory
- **Repl loop** — Type messages at the “Type here...” prompt; the bot replies (and may run tools in a loop until it responds in text).

## Requirements

- **Node.js** (ESM; `"type": "module"` in `package.json`)
- **Google Gemini API key** — set as `GEMINI_API_KEY` in `.env`

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. (Optional) Edit `SOUL.md` to change the bot’s personality and instructions.

## Usage

```bash
npm start
```

Then type at the **Type here...** prompt. The assistant will reply and may invoke file-system tools; tool results are fed back until it returns a final text response.

## Project structure

| Path | Purpose |
|------|--------|
| `index.js` | Entry point: REPL, Gemini client, tool-call loop, response/memory parsing |
| `SOUL.md` | System instruction / persona (Stoic Seneca + developer) |
| `services/memory.js` | In-memory history + append/load from `memory.txt` |
| `services/response_format.js` | Zod schema and JSON schema for `{ response, memory }` |
| `skills/file_system.js` | Tool definitions and `executeCommand` for read_file, list_files, present_directory |
| `memory.txt` | Persisted conversation lines (created at runtime; ignored via `.gitignore` if you add it) |
| `.env` | `GEMINI_API_KEY` (not committed) |

## Dependencies

- `@google/genai` — Gemini API client
- `@inquirer/prompts` — CLI input prompt
- `dotenv` — load `.env`
- `zod` — response validation
- `zod-to-json-schema` — (optional) schema conversion

## License

ISC
