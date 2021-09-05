'use strict';

const guardsServiceFactory = require('../../../src/service/guards-service');
const CustomError = require("../../../src/error/custom-error");

describe('Guards Service', () => {
  const expirationTime = '2021-09-02T11:00:00.000Z';
  const expectedMaxGuardsCount = '3';
  const uuid = 'abc';
  const userId = 1;

  const timeMachineMock = {
    getGuardExpirationTime: jest.fn(() => expirationTime)
  };
  const generateUuidMock = jest.fn(() => uuid);
  const loggerMock = {
    error: jest.fn()
  };
  const configMock = {
    get: jest.fn(() => expectedMaxGuardsCount)
  };

  const getGuardsService = guardsRepositoryMock => guardsServiceFactory({
    guardsRepository: guardsRepositoryMock,
    config: configMock,
    logger: loggerMock,
    timeMachine: timeMachineMock,
    generateUuid: generateUuidMock
  });

  const assertError = ({ error, expectedError }) => {
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(expectedError);
    expect(error.status).toBe(expectedError.status);
    expect(error.message).toBe(expectedError.message);
    expect(error.errorCode).toBe(expectedError.errorCode);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Guard', () => {
    const redisKey = 'redis_key';

    const assertAddGuardFlow = guardsRepositoryMock => {
      expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
      expect(generateUuidMock).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId: uuid });
      expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, expirationTime);
    };

    it('Should return created guardId', async () => {
      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => ([])),
        prepareKey: jest.fn(() => redisKey),
        saveGuard: jest.fn(() => true),
      };

      const { guardId } = await getGuardsService(guardsRepositoryMock).addGuard({ userId });

      assertAddGuardFlow(guardsRepositoryMock);
      expect(guardId).toBe(uuid);
    });

    it('Should throw error when existing guards exceeded max limit', async () => {
      const userGuards = ['1_abc', '1_xyz', '1_jkl'];
      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => userGuards)
      };
      const expectedError = {
        status: 403,
        message: 'Reached max guards count',
        errorCode: 'REACHED_MAX_GUARDS_COUNT'
      };

      try {
        await getGuardsService(guardsRepositoryMock).addGuard({ userId });
      } catch (error) {
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw error when guard was not saved', async () => {
      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => ([])),
        prepareKey: jest.fn(() => redisKey),
        saveGuard: jest.fn(() => false),
      };
      const expectedError = {
        status: 500,
        message: 'Failed to create guard',
        errorCode: 'FAILED_TO_CREATE_GUARD'
      };

      try {
        await getGuardsService(guardsRepositoryMock).addGuard({ userId });
      } catch (error) {
        assertAddGuardFlow(guardsRepositoryMock);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an unexpected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while creating guard',
        errorCode: 'COULD_NOT_CREATE_GUARD'
      };

      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => {
          throw new Error('unexpected error');
        }),
        prepareKey: jest.fn(() => redisKey),
        saveGuard: jest.fn(() => false),
      };

      try {
        await getGuardsService(guardsRepositoryMock).addGuard({ userId });
      } catch (error) {
        assertError({ error, expectedError });

        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an expected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while creating guard',
        errorCode: 'COULD_NOT_CREATE_GUARD'
      };

      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => {
          throw new CustomError(expectedError)
        }),
        prepareKey: jest.fn(() => redisKey),
        saveGuard: jest.fn(() => false)
      };

      try {
        await getGuardsService(guardsRepositoryMock).addGuard({ userId });
      } catch (error) {
        expect(error.status).toBe(expectedError.status);
        expect(error.message).toBe(expectedError.message);
        expect(error.errorCode).toBe(expectedError.errorCode);

        return;
      }

      fail('Test should not reach here');
    });
  });

  describe('Refresh Guard', () => {
    const guardId = 'abc';
    const redisKey = `${userId}_${guardId}`;
    const guardValue = '2021-09-02T22:00:00.000Z';

    const assertRefreshGuardFlow = guardsRepositoryMock => {
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
    };

    it('Should return refreshed guard id', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        saveGuard: jest.fn(() => true)
      };

      const { guardId: returnedGuardId } = await getGuardsService(guardsRepositoryMock).refreshGuard({ userId, guardId });

      assertRefreshGuardFlow(guardsRepositoryMock);
      expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, expirationTime);
      expect(returnedGuardId).toBe(guardId);
    });

    it('Should throw error when guard with given id does not exist', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => null),
      };
      const expectedError = {
        status: 404,
        message: 'Guard does not exist',
        errorCode: 'GUARD_DOES_NOT_EXIST'
      };

      try {
        await getGuardsService(guardsRepositoryMock).refreshGuard({ userId, guardId });
      } catch (error) {
        assertRefreshGuardFlow(guardsRepositoryMock);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw error when guard with given id was not refreshed', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        saveGuard: jest.fn(() => false)
      };
      const expectedError = {
        status: 500,
        message: 'Failed to create guard',
        errorCode: 'FAILED_TO_CREATE_GUARD'
      };

      try {
        await getGuardsService(guardsRepositoryMock).refreshGuard({ userId, guardId });
      } catch (error) {
        assertRefreshGuardFlow(guardsRepositoryMock);
        expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, expirationTime);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an unexpected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while refreshing guard',
        errorCode: 'COULD_NOT_REFRESH_GUARD'
      };

      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => {
          throw new Error('unexpected error');
        }),
        getGuard: jest.fn(() => guardValue),
        saveGuard: jest.fn(() => false)
      };

      try {
        await getGuardsService(guardsRepositoryMock).refreshGuard({ userId });
      } catch (error) {
        assertError({ error, expectedError });

        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an expected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while refreshing guard',
        errorCode: 'COULD_NOT_REFRESH_GUARD'
      };

      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => {
          throw new CustomError(expectedError)
        }),
        getGuard: jest.fn(() => guardValue),
        saveGuard: jest.fn(() => false)
      };

      try {
        await getGuardsService(guardsRepositoryMock).refreshGuard({ userId });
      } catch (error) {
        expect(error.status).toBe(expectedError.status);
        expect(error.message).toBe(expectedError.message);
        expect(error.errorCode).toBe(expectedError.errorCode);

        return;
      }

      fail('Test should not reach here');
    });

  });

  describe('Remove Guard', () => {
    const guardId = 'abc';
    const redisKey = `${userId}_${guardId}`;
    const guardValue = '2021-09-02T22:00:00.000Z';

    const assertDeleteGuardFlow = guardsRepositoryMock => {
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
    };

    it('Should return deleted guard id', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        removeGuard: jest.fn(() => true)
      };

      const { guardId: returnedGuardId } = await getGuardsService(guardsRepositoryMock).removeGuard({ userId, guardId });

      assertDeleteGuardFlow(guardsRepositoryMock);
      expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledWith(redisKey);
      expect(returnedGuardId).toBe(guardId);
    });

    it('Should throw error when guard with given id does not exist', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => null),
      };
      const expectedError = {
        status: 404,
        message: 'Guard does not exist',
        errorCode: 'GUARD_DOES_NOT_EXIST'
      };

      try {
        await getGuardsService(guardsRepositoryMock).removeGuard({ userId, guardId });
      } catch (error) {
        assertDeleteGuardFlow(guardsRepositoryMock);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw error when guard with given id was not deleted', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        removeGuard: jest.fn(() => false)
      };
      const expectedError = {
        status: 500,
        message: 'Failed to delete guard',
        errorCode: 'FAILED_TO_DELETE_GUARD'
      };

      try {
        await getGuardsService(guardsRepositoryMock).removeGuard({ userId, guardId });
      } catch (error) {
        assertDeleteGuardFlow(guardsRepositoryMock);
        expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledWith(redisKey);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an unexpected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while deleting guard',
        errorCode: 'COULD_NOT_DELETE_GUARD'
      };

      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => {
          throw new Error('unexpected error');
        }),
        getGuard: jest.fn(() => guardValue),
        removeGuard: jest.fn(() => false)
      };

      try {
        await getGuardsService(guardsRepositoryMock).removeGuard({ userId, guardId });
      } catch (error) {
        assertError({ error, expectedError });

        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw custom error when when an expected error occurred', async () => {
      const expectedError = {
        status: 500,
        message: 'An error occurred while deleting guard',
        errorCode: 'COULD_NOT_DELETE_GUARD'
      };

      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => {
          throw new CustomError(expectedError)
        }),
        getGuard: jest.fn(() => guardValue),
        removeGuard: jest.fn(() => false)
      };

      try {
        await getGuardsService(guardsRepositoryMock).removeGuard({ userId, guardId });
      } catch (error) {
        expect(error.status).toBe(expectedError.status);
        expect(error.message).toBe(expectedError.message);
        expect(error.errorCode).toBe(expectedError.errorCode);

        return;
      }

      fail('Test should not reach here');
    });
  });
});
