'use strict';

const config = require('config');
const Redis = require('ioredis');
const sendRequest = require('./send-request');
const { sleep } = require('../../utils');

describe('Refresh Guard', () => {
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

  it("Should refresh guard's expiration time and ttl", async () => {
    const userId = 1;
    const { body: { guardId } } = await sendRequest({ method: 'POST', userId });
    const redisKey = `${userId}_${guardId}`;

    const valueBeforeRefresh = await redis.get(redisKey);
    expect(valueBeforeRefresh).not.toBeNull();

    await sleep(1000);
    const ttlBeforeRefresh = await redis.ttl(redisKey);

    const { statusCode } = await sendRequest({ method: 'PATCH', userId, guardId });
    expect(statusCode).toBe(204);

    const valueAfterRefresh = await redis.get(redisKey);
    const expirationTimeBeforeRefresh = new Date(valueBeforeRefresh).getTime();
    const expirationTimeAfterRefresh = new Date(valueAfterRefresh).getTime();
    expect(expirationTimeBeforeRefresh).toBeLessThan(expirationTimeAfterRefresh);

    const ttlAfterRefresh = await redis.ttl(redisKey);
    const DEFAULT_TTL = config.get('redis.ttlInSeconds');

    expect(ttlBeforeRefresh).toBeLessThan(ttlAfterRefresh);
    expect(ttlAfterRefresh).toBe(DEFAULT_TTL);
  });

  it('Should throw error when user tries to delete guard that does not exist', async () => {
    const userId = 1;
    const FAKE_GUARD_ID = '9296522e-cbd1-45ec-bbc9-1e6c1134bd73';

    try {
      await sendRequest({ method: 'PATCH', userId, guardId: FAKE_GUARD_ID });
    } catch (error) {
      expect(error.response.statusCode).toBe(404);
      expect(error.response.body.message).toBe('Guard does not exist');
      expect(error.response.body.errorCode).toBe('GUARD_DOES_NOT_EXIST');
      return;
    }

    fail('Test should not reach here');
  });

  it('Should throw error when given guard id and was invalid', async () => {
    const userId = 1;
    const invalidGuardId = 'invalid_id';

    try {
      await sendRequest({ method: 'PATCH', userId, guardId: invalidGuardId });
    } catch (error) {
      expect(error.response.statusCode).toBe(400);
      return;
    }

    fail('Test should not reach here');
  });
});
