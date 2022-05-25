const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'C:/alterna/logs/alterna-api.log',
      level: 'info',
      format: winston.format.combine(winston.format.timestamp()),
      json: true,
      timestamp: true,
      maxsize: 5120,
      maxFiles: 5,
      handleExceptions: true,
    }),
    new winston.transports.Console({
      level: 'debug',
      json: true,
      timestamp: true,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

/*
error
warn
info
debug
...
*/

/*
fatal
error
warn
info
debug

*/

module.exports = logger;