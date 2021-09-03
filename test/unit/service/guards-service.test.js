'use strict';

const guardsServiceFactory = require('../../../src/service/guards-service');

describe('Guards Service', () => {
  const EXPIRATION_TIME = '2021-09-02T11:00:00.000Z';
  const UUID = 'abc';
  const userId = 1;

  const timeMachineMock = {
    getGuardExpirationTime: jest.fn(() => EXPIRATION_TIME)
  };
  const generateUuidMock = jest.fn(() => UUID);
  const loggerMock = {
    error: jest.fn()
  };
  const expectedMaxGuardsCount = '3';
  const configMock = {
    get: jest.fn(() => expectedMaxGuardsCount)
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const assertError = ({ error, expectedError }) => {
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(expectedError);
    expect(error.status).toBe(expectedError.status);
    expect(error.message).toBe(expectedError.message);
    expect(error.errorCode).toBe(expectedError.errorCode);
  };

  describe('Add Guard', () => {
    it('Should return created guardId', async () => {
      const redisKey = 'redis_key';
      const guardsRepositoryMock = {
        getUserGuards: jest.fn(() => ([])),
        prepareKey: jest.fn(() => redisKey),
        saveGuard: jest.fn(() => true),
      };

      const { guardId } = await guardsServiceFactory({
        guardsRepository: guardsRepositoryMock,
        config: configMock,
        logger: loggerMock,
        timeMachine: timeMachineMock,
        generateUuid: generateUuidMock
      }).addGuard({ userId });

      expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
      expect(generateUuidMock).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId: UUID });
      expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
      expect(guardId).toBe(UUID);
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).addGuard({ userId });
      } catch (error) {
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
        expect(loggerMock.error).toHaveBeenCalledTimes(1);
        expect(loggerMock.error).toHaveBeenCalledWith(expectedError);
        expect(error.status).toBe(expectedError.status);
        expect(error.message).toBe(expectedError.message);
        expect(error.errorCode).toBe(expectedError.errorCode);
        return;
      }

      fail('Test should not reach here');
    });

    it('Should throw error when guard was not saved', async () => {
      const redisKey = 'redis_key';
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).addGuard({ userId });
      } catch (error) {
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
        expect(generateUuidMock).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId: UUID });
        expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
        assertError({ error, expectedError });
        return;
      }

      fail('Test should not reach here');
    });
  });

  describe('Refresh Guard', () => {
    const guardId = 'abc';
    const redisKey = `${userId}_${guardId}`;
    const guardValue = '2021-09-02T22:00:00.000Z';

    it('Should return refreshed guard id', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        saveGuard: jest.fn(() => true)
      };

      const { guardId: returnedGuardId } = await guardsServiceFactory({
        guardsRepository: guardsRepositoryMock,
        timeMachine: timeMachineMock,
        generateUuid: generateUuidMock,
        logger: loggerMock,
        config: configMock
      }).refreshGuard({ userId, guardId });

      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
      expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).refreshGuard({ userId, guardId });
      } catch (error) {
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).refreshGuard({ userId, guardId });
      } catch (error) {
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
        expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
        assertError({ error, expectedError });

        return;
      }

      fail('Test should not reach here');
    });
  });

  describe('Remove Guard', () => {
    const guardId = 'abc';
    const redisKey = `${userId}_${guardId}`;
    const guardValue = '2021-09-02T22:00:00.000Z';

    it('Should return deleted guard id', async () => {
      const guardsRepositoryMock = {
        prepareKey: jest.fn(() => redisKey),
        getGuard: jest.fn(() => guardValue),
        removeGuard: jest.fn(() => true)
      };

      const { guardId: returnedGuardId } = await guardsServiceFactory({
        guardsRepository: guardsRepositoryMock,
        timeMachine: timeMachineMock,
        generateUuid: generateUuidMock,
        logger: loggerMock,
        config: configMock
      }).removeGuard({ userId, guardId });

      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
      expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).removeGuard({ userId, guardId });
      } catch (error) {
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
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
        await guardsServiceFactory({
          guardsRepository: guardsRepositoryMock,
          timeMachine: timeMachineMock,
          generateUuid: generateUuidMock,
          logger: loggerMock,
          config: configMock
        }).removeGuard({ userId, guardId });
      } catch (error) {
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
        expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledTimes(1);
        expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledWith(redisKey);
        assertError({ error, expectedError });

        return;
      }

      fail('Test should not reach here');
    });
  });
});
