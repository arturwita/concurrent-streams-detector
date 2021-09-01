"use strict";

require('dotenv').config();
const errorHandler = require('./src/error/error-handler');
const guardRoutes = require("./src/router/guard-routes")


const fastify = require("fastify")({
    ignoreTrailingSlash: true,
    logger: true
})

fastify.setErrorHandler(errorHandler)
guardRoutes.forEach(route => fastify.register(route))

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

fastify.listen({ port, host })
    .then(address => console.log(`Server listening on ${address}`))
    .catch(err => {
        console.log('Error starting server:', err);
        process.exit(1);
    });
