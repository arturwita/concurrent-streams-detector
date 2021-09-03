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

const containerFactory = ({ app, config }) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    app: asValue(app),
    config: asValue(config),
    logger: asFunction(loggerFactory),
    redis: asFunction(redisFactory), // TODO: fix
    timeMachine: asFunction(timeMachineFactory),
    generateUuid: asValue(getUuidV4),
    verifyUserId: asFunction(verifyUserIdFactory),
    guardsRepository: asFunction(guardsRepositoryFactory),
    guardsService: asFunction(guardsServiceFactory),
    guardsController: asFunction(guardsControllerFactory),
  });

  return container;
};

module.exports = containerFactory;
