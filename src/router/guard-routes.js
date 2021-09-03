'use strict';

const guardIdSchema = require('./validation-schemas/guard-id-schema');

const BASE_URI = '/guards';

const registerAddGuardRoute = ({ app, guardsController, verifyUserId }) => {
  app.route({
    method: 'POST',
    url: BASE_URI,
    preHandler: verifyUserId,
    handler: guardsController.addGuard
  });
};

const registerRefreshGuardRoute = ({ app, guardsController, verifyUserId }) => {
  app.route({
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
};

const registerRemoveGuardRoute = ({ app, guardsController, verifyUserId }) => {
  app.route({
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
};

module.exports = {
  registerAddGuardRoute,
  registerRefreshGuardRoute,
  registerRemoveGuardRoute
};
