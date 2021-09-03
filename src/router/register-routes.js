'use strict';

const { asFunction } = require('awilix');
const { registerAddGuardRoute, registerRefreshGuardRoute, registerRemoveGuardRoute } = require('./guard-routes');

const registerRoutes = container => {
  container.register({
    addGuardRoute: asFunction(registerAddGuardRoute),
    refreshGuardRoute: asFunction(registerRefreshGuardRoute),
    removeGuardRoute: asFunction(registerRemoveGuardRoute),
  });

  container.resolve('addGuardRoute');
  container.resolve('refreshGuardRoute');
  container.resolve('removeGuardRoute');
};

module.exports = registerRoutes;
