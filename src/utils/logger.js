'use strict';

const winston = require('winston');

const loggerFactory = context => {
  const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { context },
    transports: new winston.transports.Console(),
  });

  const info = message => logger.info(message);
  const error = err => logger.error(err);

  return {
    info,
    error
  };
};

module.exports = loggerFactory;
