const winston = require("winston");

interface LogProperties {
  level: string;
  message: string;
  timestamp: string;
}

const consoleTransport = new winston.transports.Console();

const customFormat = winston.format.printf((info: LogProperties) => {
  return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
});

export const logger = winston.createLogger({
  level: "info",
  // format: winston.format.json(),
  format: winston.format.combine(winston.format.timestamp(), customFormat),
  defaultMeta: { service: "user-service" },
  // transports: [new winston.transports.File({ filename: "error.log", level: "error" }), new winston.transports.File({ filename: "combined.log" })]
  tranports: [consoleTransport]
});
