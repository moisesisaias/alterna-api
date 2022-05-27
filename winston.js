const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "C:/alterna/logs/alterna-api.log",
      level: "info",
      // json: true,
      timestamp: true,
      maxsize: 5120,
      maxFiles: 5,
      handleExceptions: true,
    }),
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
