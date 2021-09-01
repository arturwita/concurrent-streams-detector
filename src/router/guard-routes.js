'use strict';

const BASE_URI = "/guards"

const verifyUserId = require("../middleware/verify-user-id");
const guardsControllerFactory = require("../controller/guards-controller");
const guardsServiceFactory = require("../service/guards-service");
const guardIdSchema = require("./validation-schemas/guard-id-schema");

const guardsService = guardsServiceFactory();
const guardsController = guardsControllerFactory({ guardsService });

const addGuard = function (fastify, opts, done) {
    fastify.route({
        method: 'POST',
        url: BASE_URI,
        preHandler: verifyUserId,
        handler: guardsController.addGuard
    });

    done();
};

const refreshGuard = function (fastify, opts, done) {
    fastify.route({
        method: 'PATCH',
        url: `${BASE_URI}/:id`,
        schema: {
            params: {
                id: guardIdSchema
            }
        },
        preHandler: verifyUserId,
        handler: guardsController.refreshGuard
    });

    done();
};

const removeGuard = function (fastify, opts, done) {
    fastify.route({
        method: 'DELETE',
        url: `${BASE_URI}/:id`,
        schema: {
            params: {
                id: guardIdSchema
            }
        },
        preHandler: verifyUserId,
        handler: guardsController.removeGuard
    });

    done();
};

module.exports = [
    addGuard,
    refreshGuard,
    removeGuard
];
