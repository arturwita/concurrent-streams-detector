'use strict';

require('dotenv').config();
const config = require('config');
const fastifyFactory = require('fastify');
const containerFactory = require('./src/dependency-injection/containter-factory');
const errorHandler = require('./src/error/error-handler');
const validatorCompiler = require('./src/validator/validator-compiler');

const fastify = fastifyFactory({ ...config.get('fastify') });
fastify.register(require('fastify-cors'));

const container = containerFactory({ app: fastify, config });

fastify.setErrorHandler(errorHandler);
fastify.setValidatorCompiler(validatorCompiler);

const {
  logger, addGuardRoute, refreshGuardRoute, removeGuardRoute
} = container.cradle;

fastify.route(addGuardRoute);
fastify.route(refreshGuardRoute);
fastify.route(removeGuardRoute);

const { host, port } = config.get('app');

fastify.listen({ port, host })
  .then(address => { logger.info(`Server running on ${address}`); })
  .catch(error => {
    logger.error({ message: 'Error starting server', error });
    process.exit(1);
  });
