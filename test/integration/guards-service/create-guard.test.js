'use strict';

const config = require('config');
const Redis = require('ioredis');
const sendRequest = require('./send-request');

describe('POST /guards', () => {
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

    it('Should create guard and save it in db', async () => {
        const userId = 1;
        const { body: { guardId }, statusCode } = await sendRequest({ method: 'POST', userId });

        expect(statusCode).toBe(200);
        expect(typeof guardId).toBe('string');

        const redisKey = `${userId}_${guardId}`;
        const value = await redis.get(redisKey);

        expect(value).not.toBeNull();
    });

    it('Should throw error if user tries to create more than max guards', async () => {
        const MAX_GUARDS_COUNT = config.get('app.maxGuardsCount');
        const userId = 1;

        for (let i = 0; i < MAX_GUARDS_COUNT; i++) {
            await sendRequest({ method: 'POST', userId });
        }

        const userKeysRegex = `${userId}_*`;
        const userGuards = await redis.keys(userKeysRegex);
        expect(userGuards.length).toBe(MAX_GUARDS_COUNT);

        try {
            await sendRequest({ method: 'POST', userId });
        }
        catch (error) {
            expect(error.response.statusCode).toBe(403);
            expect(error.response.body.message).toBe("Reached max guards count");
            expect(error.response.body.errorCode).toBe("REACHED_MAX_GUARDS_COUNT");
        }
    });
});
