'use strict';

const {
  createContainer, asFunction, asValue, InjectionMode
} = require('awilix');
const { v4: getUuidV4 } = require('uuid');
const loggerFactory = require('../utils/logger');
const redisFactory = require('../utils/redis-factory');
const guardsRepositoryFactory = require('../repository/guards-repository');
const verifyUserIdFactory = require('../middleware/verify-user-id');
const guardsServiceFactory = require('../service/guards-service');
const guardsControllerFactory = require('../controller/guards-controller');
const timeMachineFactory = require('../utils/time-machine');
const errorHandlerFactory = require('../error/error-handler');
const { registerAddGuardRoute, registerRefreshGuardRoute, registerRemoveGuardRoute } = require('../router/guard-routes');

const containerFactory = ({ app, config }) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    app: asValue(app),
    config: asValue(config),
    logger: asFunction(loggerFactory),
    redis: asFunction(redisFactory).singleton(),
    timeMachine: asFunction(timeMachineFactory),
    generateUuid: asValue(getUuidV4),
    verifyUserId: asFunction(verifyUserIdFactory),
    errorHandler: asFunction(errorHandlerFactory),
    guardsRepository: asFunction(guardsRepositoryFactory),
    guardsService: asFunction(guardsServiceFactory),
    guardsController: asFunction(guardsControllerFactory),

    // Application routes
    addGuardRoute: asFunction(registerAddGuardRoute),
    refreshGuardRoute: asFunction(registerRefreshGuardRoute),
    removeGuardRoute: asFunction(registerRemoveGuardRoute),
  });

  return container;
};

module.exports = containerFactory;
