"use strict";

const config = require("config");
const guardsRepositoryFactory = require("../../../src/repository/guards-repository");

describe("Guards Repository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Prepare Key", () => {
        it("Should properly prepare redis key", () => {
            const userId = 1;
            const guardId = "abc";
            const redisMock = {};

            const key = guardsRepositoryFactory(redisMock).prepareKey({ userId, guardId });
            expect(key).toBe("1_abc");
        });
    });

    describe("Save Guard", () => {
        const userId = 1;
        const ttl = config.get("redis.ttlInSeconds");
        const guardId = "abc";

        it("Should return true if guard was successfully saved", async () => {
            const redisMock = {
                setex: jest.fn(() => "OK")
            };

            const wasSaved = await guardsRepositoryFactory(redisMock).saveGuard(userId, guardId);
            expect(redisMock.setex).toHaveBeenCalledWith(userId, ttl, guardId);
            expect(wasSaved).toBe(true);
        });

        it("Should return false if guard was not saved", async () => {
            const redisMock = {
                setex: jest.fn(() => "NOT_OK")
            };

            const wasSaved = await guardsRepositoryFactory(redisMock).saveGuard(userId, guardId);
            expect(redisMock.setex).toHaveBeenCalledWith(userId, ttl, guardId);
            expect(wasSaved).toBe(false);
        });
    });

    describe("Get Guard", () => {
        const key = "redis_key";

        it("Should call getGuard with given arguments", async () => {
            const redisMock = {
                get: jest.fn()
            };

            await guardsRepositoryFactory(redisMock).getGuard(key);
            expect(redisMock.get).toHaveBeenCalledWith(key);
        });
    });

    describe("Get User Guards", () => {
        const userId = 1;
        const userGuardsRegex = `${userId}_*`;

        it("Should call getUserGuards with given arguments", async () => {
            const redisMock = {
                keys: jest.fn()
            };

            await guardsRepositoryFactory(redisMock).getUserGuards(userId);
            expect(redisMock.keys).toHaveBeenCalledWith(userGuardsRegex);
        });
    });

    describe("Remove Guard", () => {
        const key = "redis_key";

        it("Should return true if guard was successfully removed", async () => {
            const redisMock = {
                del: jest.fn(() => 1)
            };

            const wasSaved = await guardsRepositoryFactory(redisMock).removeGuard(key);
            expect(redisMock.del).toHaveBeenCalledWith(key);
            expect(wasSaved).toBe(true);
        });

        it("Should return false if guard was not saved", async () => {
            const redisMock = {
                del: jest.fn(() => 0)
            };

            const wasSaved = await guardsRepositoryFactory(redisMock).removeGuard(key);
            expect(redisMock.del).toHaveBeenCalledWith(key);
            expect(wasSaved).toBe(false);
        });
    });
});

