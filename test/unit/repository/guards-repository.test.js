'use strict';

const guardsRepositoryFactory = require('../../../src/repository/guards-repository');

describe('Guards Repository', () => {
  const exampleTtl = 2;
  const config = {
    get: jest.fn(() => exampleTtl)
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Prepare Key', () => {
    it('Should properly prepare redis key', () => {
      const userId = 1;
      const guardId = 'abc';
      const redis = {};

      const key = guardsRepositoryFactory({ config, redis }).prepareKey({ userId, guardId });
      expect(key).toBe('1_abc');
    });
  });

  describe('Save Guard', () => {
    const userId = 1;
    const guardId = 'abc';

    it('Should return true if guard was successfully saved', async () => {
      const redis = {
        setex: jest.fn(() => 'OK')
      };

      const wasSaved = await guardsRepositoryFactory({ config, redis }).saveGuard(userId, guardId);
      expect(redis.setex).toHaveBeenCalledWith(userId, exampleTtl, guardId);
      expect(wasSaved).toBe(true);
    });

    it('Should return false if guard was not saved', async () => {
      const redis = {
        setex: jest.fn(() => 'NOT_OK')
      };

      const wasSaved = await guardsRepositoryFactory({ config, redis }).saveGuard(userId, guardId);
      expect(redis.setex).toHaveBeenCalledWith(userId, exampleTtl, guardId);
      expect(wasSaved).toBe(false);
    });
  });

  describe('Get Guard', () => {
    const key = 'redis_key';

    it('Should call getGuard with given arguments', async () => {
      const redis = {
        get: jest.fn()
      };

      await guardsRepositoryFactory({ config, redis }).getGuard(key);
      expect(redis.get).toHaveBeenCalledWith(key);
    });
  });

  describe('Get User Guards', () => {
    const userId = 1;
    const userGuardsRegex = `${userId}_*`;

    it('Should call getUserGuards with given arguments', async () => {
      const redis = {
        keys: jest.fn()
      };

      await guardsRepositoryFactory({ config, redis }).getUserGuards(userId);
      expect(redis.keys).toHaveBeenCalledWith(userGuardsRegex);
    });
  });

  describe('Remove Guard', () => {
    const key = 'redis_key';

    it('Should return true if guard was successfully removed', async () => {
      const redis = {
        del: jest.fn(() => 1)
      };

      const wasSaved = await guardsRepositoryFactory({ config, redis }).removeGuard(key);
      expect(redis.del).toHaveBeenCalledWith(key);
      expect(wasSaved).toBe(true);
    });

    it('Should return false if guard was not saved', async () => {
      const redis = {
        del: jest.fn(() => 0)
      };

      const wasSaved = await guardsRepositoryFactory({ config, redis }).removeGuard(key);
      expect(redis.del).toHaveBeenCalledWith(key);
      expect(wasSaved).toBe(false);
    });
  });
});
