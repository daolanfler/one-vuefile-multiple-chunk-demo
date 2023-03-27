import * as log4js from "log4js";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";

const logFileName = resolve(__dirname, "./logs/cheese.log");
if (existsSync(logFileName)) {
  unlinkSync(logFileName);
}

log4js.configure({
  appenders: {
    cheese: {
      type: "file",
      filename: logFileName,
    },
  },
  categories: {
    default: { appenders: ["cheese"], level: "info" },
  },
});

export const logger = log4js.getLogger();
