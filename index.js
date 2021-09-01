"use strict";

require('dotenv').config();
const errorHandler = require('./src/error/error-handler');
const guardRoutes = require("./src/router/guard-routes");
const validatorCompiler = require('./src/validator/validator-compiler');
const loggerFactory = require("./src/utils/logger");
const logger = loggerFactory("index");

const fastify = require("fastify")({
    ignoreTrailingSlash: true
});

fastify.setErrorHandler(errorHandler);
fastify.setValidatorCompiler(validatorCompiler);

guardRoutes.forEach(route => fastify.register(route));

const host = process.env.APP_HOST || "127.0.0.1";
const port = process.env.APP_PORT || 3000;

fastify.listen({ port, host })
    .then(address => logger.info({ message: `Server listening on ${address}` }))
    .catch(error => {
        logger.error({ message: 'Error starting server', error });
        process.exit(1);
    });