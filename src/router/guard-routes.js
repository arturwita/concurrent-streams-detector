'use strict';

const config = require("config");
const guardsControllerFactory = require("../controller/guards-controller");
const guardsServiceFactory = require("../service/guards-service");
const { guardsRepositoryFactory } = require("../repository/guards-repository");
const timeMachineFactory = require("../utils/time-machine");
const verifyUserId = require("../middleware/verify-user-id");
const guardIdSchema = require("./validation-schemas/guard-id-schema");

const timeMachine = timeMachineFactory();
const guardsRepository = guardsRepositoryFactory({
    port: config.get("redis.port"),
    host: config.get("redis.host")
});
const guardsService = guardsServiceFactory({ guardsRepository, timeMachine });
const guardsController = guardsControllerFactory(guardsService);

const BASE_URI = "/guards";

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
