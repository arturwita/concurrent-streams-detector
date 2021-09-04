'use strict';

const config = require('config');
const Redis = require('ioredis');
const sendRequest = require('./send-request');

describe('Delete Guard', () => {
  const redis = new Redis({
    port: config.get('redis.port'),
    host: '0.0.0.0'
  });

  beforeEach(async () => {
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.disconnect();
  });

  it('Should delete guard with given id', async () => {
    const userId = 1;
    const { body: { guardId } } = await sendRequest({ method: 'POST', userId });
    const redisKey = `${userId}_${guardId}`;

    const value = await redis.get(redisKey);
    expect(value).not.toBeNull();

    const { statusCode } = await sendRequest({ method: 'DELETE', userId, guardId });
    expect(statusCode).toBe(204);

    const valueAfterDeletion = await redis.get(redisKey);
    expect(valueAfterDeletion).toBeNull();
  });

  it('Should throw error when user tries to delete guard that does not exist', async () => {
    const userId = 1;
    const fakeGuardId = '9296522e-cbd1-45ec-bbc9-1e6c1134bd73';

    try {
      await sendRequest({ method: 'DELETE', userId, guardId: fakeGuardId });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
      expect(error.response.body.message).toBe('Guard does not exist');
      expect(error.response.body.errorCode).toBe('GUARD_DOES_NOT_EXIST');
      return;
    }

    fail('Test should not reach here');
  });

  it('Should delete guard with given id and fail return 404 after deleting it again', async () => {
    const userId = 1;
    const { body: { guardId } } = await sendRequest({ method: 'POST', userId });

    const { statusCode } = await sendRequest({ method: 'DELETE', userId, guardId });
    expect(statusCode).toBe(204);

    try {
      await sendRequest({ method: 'DELETE', userId, guardId });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
      return;
    }

    fail('Test should not reach here');
  });

  it('Should throw error when given guard id and was invalid', async () => {
    const userId = 1;
    const invalidGuardId = 'invalid_id';

    try {
      await sendRequest({ method: 'DELETE', userId, guardId: invalidGuardId });
    } catch (error) {
      expect(error.response.statusCode).toBe(400);
      return;
    }

    fail('Test should not reach here');
  });
});
