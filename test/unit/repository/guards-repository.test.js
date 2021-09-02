"use strict";

const config = require("config");
const Redis = require('ioredis');
const guardsRepositoryFactory = require("../../../src/repository/guards-repository");
const { sleep } = require("../../utils");

describe("Guards Repository", () => {
    const redisConfig = {
        port: config.get('redis.port'),
        host: '0.0.0.0'
    };

    const redis = new Redis(redisConfig);
    const guardsRepository = guardsRepositoryFactory(redisConfig);
    const DEFAULT_REDIS_VALUE = "1";

    const saveGuardHelper = async (key, value = DEFAULT_REDIS_VALUE) => await redis.set(key, value);

    beforeEach(async () => {
        await redis.flushall();
    });

    afterAll(async () => {
        await redis.disconnect();
    });

    it("Should properly prepare redis key", () => {
        const userId = 1;
        const guardId = "abc";

        const key = guardsRepository.prepareKey({ userId, guardId });
        expect(key).toBe("1_abc");
    });

    describe("Save Guard", () => {
        it("Should return true if guard was successfully created", async () => {
            const wasSaved = await guardsRepository.saveGuard("key", DEFAULT_REDIS_VALUE);
            expect(wasSaved).toBe(true);
        });

        it("Should set ttl to given value", async () => {
            const key = "redis_key";
            await guardsRepository.saveGuard(key, DEFAULT_REDIS_VALUE);

            const EXPECTED_VALUE = 2;
            const ttl = await redis.ttl(key);
            expect(ttl).toBe(EXPECTED_VALUE);
        });

        it("Should return null if guard's ttl has expired", async () => {
            const key = "redis_key";
            const DEFAULT_TTL_IN_SECONDS = config.get("redis.ttlInSeconds");
            await guardsRepository.saveGuard(key, DEFAULT_REDIS_VALUE);

            await sleep(DEFAULT_TTL_IN_SECONDS * 1000);

            const value = await redis.get(key);
            expect(value).toBeNull();
        });

        it("Should refresh ttl after updating guard under existing key", async () => {
            const key = "redis_key";
            const DEFAULT_TTL_IN_SECONDS = config.get("redis.ttlInSeconds");
            await guardsRepository.saveGuard(key, DEFAULT_REDIS_VALUE);

            await sleep(DEFAULT_TTL_IN_SECONDS * 500);

            const UPDATED_VALUE = "updated_value";
            await guardsRepository.saveGuard(key, UPDATED_VALUE);

            const EXPECTED_TTL = 2;
            const ttl = await redis.ttl(key);
            expect(ttl).toBe(EXPECTED_TTL);

            const value = await redis.get(key);
            expect(value).toBe(UPDATED_VALUE);
        });
    });

    describe("Get Guard", () => {
        it("Should return guard with given key", async () => {
            const key = "redis_key";
            await saveGuardHelper(key);

            const value = await redis.get(key);
            expect(value).toBe(DEFAULT_REDIS_VALUE);
        });

        it("Should return null if guard with given key does not exist", async () => {
            const key = "nonexistent_key";

            const value = await redis.get(key);
            expect(value).toBeNull();
        });
    });

    describe("Get User Guards", () => {
        it("Should return all guards created for user with given id", async () => {
            const userId = 1;
            const firstGuardKey = `${userId}_abc`;
            const secondGuardKey = `${userId}_xyz`;

            await saveGuardHelper(firstGuardKey);
            await saveGuardHelper(secondGuardKey);

            const guards = await guardsRepository.getUserGuards(userId);

            const EXPECTED_VALUE = 2;
            expect(guards.length).toBe(EXPECTED_VALUE);
            expect(guards).toEqual(expect.arrayContaining([firstGuardKey, secondGuardKey]));
        });

        it("Should not return guards created for other users", async () => {
            const firstUserId = 1;
            const secondUserId = 2;
            const firstUserGuardKey = `${firstUserId}_abc`;
            const secondUserGuardKey = `${secondUserId}_xyz`;

            await saveGuardHelper(firstUserGuardKey);
            await saveGuardHelper(secondUserGuardKey);

            const guards = await guardsRepository.getUserGuards(firstUserId);

            const EXPECTED_VALUE = 1;
            expect(guards.length).toBe(EXPECTED_VALUE);
            expect(guards).toEqual(expect.arrayContaining([firstUserGuardKey]));
        });
    });

    describe("Remove Guard", () => {
        it("Should return true if guard with given key was successfully deleted", async () => {
            const key = "redis_key";
            await saveGuardHelper(key);

            const existingValue = await redis.get(key);
            expect(existingValue).toBe(DEFAULT_REDIS_VALUE);

            const wasDeleted = await guardsRepository.removeGuard(key);
            expect(wasDeleted).toBe(true);

            const deletedValue = await redis.get(key);
            expect(deletedValue).toBeNull();
        });

        it("Should return false if guard with given key was not deleted", async () => {
            const key = "nonexistent_key";

            const wasDeleted = await guardsRepository.removeGuard(key);
            expect(wasDeleted).toBe(false);
        });
    });
});

