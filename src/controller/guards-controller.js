'use strict';

const { USER_ID } = require('../router/headers');

const guardsControllerFactory = ({ guardsService }) => {
  const addGuard = request => {
    const { [USER_ID]: userId } = request.headers;
    return guardsService.addGuard({ userId });
  };

  const refreshGuard = async (request, reply) => {
    const { id: guardId } = request.params;
    const { [USER_ID]: userId } = request.headers;

    await guardsService.refreshGuard({ guardId, userId });

    reply.code(204).send();
  };

  const removeGuard = async (request, reply) => {
    const { id: guardId } = request.params;
    const { [USER_ID]: userId } = request.headers;

    await guardsService.removeGuard({ guardId, userId });

    reply.code(204).send();
  };

  return {
    addGuard,
    refreshGuard,
    removeGuard
  };
};

module.exports = guardsControllerFactory;
