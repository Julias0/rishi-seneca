import fs from "fs";
import path from "path";

const memoryFilePath = path.join(process.cwd(), "memory.txt");

export const memoryService = {
  data: [],
  add(role, message) {
    if (message && message.length > 0) {
      const line = `role: ${role}, message: ${message}`;

      if (this.data.includes(line)) {
        return;
      }

      this.data.push(
        line
      );
      fs.appendFileSync(memoryFilePath, line.split('\n').join('\t') + "\n");
    }
  },
  clear() {
    this.data = [];
  },
  getHistory() {
    return this.data;
  },
  load() {
    if (fs.existsSync(memoryFilePath)) {
      this.data = fs.readFileSync(memoryFilePath, "utf8").split("\n");
    }
  },
};

memoryService.load();