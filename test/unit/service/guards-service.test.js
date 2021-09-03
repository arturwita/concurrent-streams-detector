"use strict";

const guardsServiceFactory = require("../../../src/service/guards-service");

describe("Guards Service", () => {
    const EXPIRATION_TIME = "2021-09-02T11:00:00.000Z";
    const UUID = "abc";
    const userId = 1;

    const timeMachineMock = {
        getGuardExpirationTime: jest.fn(() => EXPIRATION_TIME)
    };
    const generateUuidMock = jest.fn(() => UUID);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Add Guard", () => {
        it("Should return created guardId", async () => {
            const redisKey = "redis_key";
            const guardsRepositoryMock = {
                getUserGuards: jest.fn(() => ([])),
                prepareKey: jest.fn(() => redisKey),
                saveGuard: jest.fn(() => true),
            };

            const { guardId } = await guardsServiceFactory({
                guardsRepository: guardsRepositoryMock,
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

        it("Should throw error when existing guards exceeded max limit", async () => {
            const userGuards = ["1_abc", "1_xyz", "1_jkl"];
            const guardsRepositoryMock = {
                getUserGuards: jest.fn(() => userGuards)
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).addGuard({ userId });
            }
            catch (error) {
                expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
                expect(error.status).toBe(403);
                expect(error.message).toBe("Reached max guards count");
                expect(error.errorCode).toBe("REACHED_MAX_GUARDS_COUNT");
                return;
            }

            fail("Test should not reach here");
        });

        it("Should throw error when guard was not saved", async () => {
            const redisKey = "redis_key";
            const guardsRepositoryMock = {
                getUserGuards: jest.fn(() => ([])),
                prepareKey: jest.fn(() => redisKey),
                saveGuard: jest.fn(() => false),
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).addGuard({ userId });
            }
            catch (error) {
                expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getUserGuards).toHaveBeenCalledWith(userId);
                expect(generateUuidMock).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId: UUID });
                expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
                expect(error.status).toBe(500);
                expect(error.message).toBe("Failed to create guard");
                expect(error.errorCode).toBe("FAILED_TO_CREATE_GUARD");
                return;
            }

            fail("Test should not reach here");
        });
    });

    describe("Refresh Guard", () => {
        const guardId = "abc"
        const redisKey = `${userId}_${guardId}`;
        const guardValue = "2021-09-02T22:00:00.000Z";

        it("Should return refreshed guard id", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => guardValue),
                saveGuard: jest.fn(() => true)
            };

            const { guardId: returnedGuardId } = await guardsServiceFactory({
                guardsRepository: guardsRepositoryMock,
                timeMachine: timeMachineMock,
                generateUuid: generateUuidMock
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

        it("Should throw error when guard with given id does not exist", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => null),
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).refreshGuard({ userId, guardId });
            }
            catch (error) {
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
                expect(error.status).toBe(404);
                expect(error.message).toBe("Guard does not exist");
                expect(error.errorCode).toBe("GUARD_DOES_NOT_EXIST");
                return;
            }

            fail("Test should not reach here");
        });

        it("Should throw error when guard with given id was not refreshed", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => guardValue),
                saveGuard: jest.fn(() => false)
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).refreshGuard({ userId, guardId });
            }
            catch (error) {
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
                expect(timeMachineMock.getGuardExpirationTime).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.saveGuard).toHaveBeenCalledWith(redisKey, EXPIRATION_TIME);
                expect(error.status).toBe(500);
                expect(error.message).toBe("Failed to create guard");
                expect(error.errorCode).toBe("FAILED_TO_CREATE_GUARD");
                return;
            }

            fail("Test should not reach here");
        });
    });

    describe("Remove Guard", () => {
        const guardId = "abc"
        const redisKey = `${userId}_${guardId}`;
        const guardValue = "2021-09-02T22:00:00.000Z";

        it("Should return deleted guard id", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => guardValue),
                removeGuard: jest.fn(() => true)
            };

            const { guardId: returnedGuardId } = await guardsServiceFactory({
                guardsRepository: guardsRepositoryMock,
                timeMachine: timeMachineMock,
                generateUuid: generateUuidMock
            }).removeGuard({ userId, guardId });

            expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
            expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
            expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
            expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
            expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledTimes(1);
            expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledWith(redisKey);
            expect(returnedGuardId).toBe(guardId);
        });

        it("Should throw error when guard with given id does not exist", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => null),
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).removeGuard({ userId, guardId });
            }
            catch (error) {
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
                expect(error.status).toBe(404);
                expect(error.message).toBe("Guard does not exist");
                expect(error.errorCode).toBe("GUARD_DOES_NOT_EXIST");
                return;
            }

            fail("Test should not reach here");
        });

        it("Should throw error when guard with given id was not deleted", async () => {
            const guardsRepositoryMock = {
                prepareKey: jest.fn(() => redisKey),
                getGuard: jest.fn(() => guardValue),
                removeGuard: jest.fn(() => false)
            };

            try {
                await guardsServiceFactory({
                    guardsRepository: guardsRepositoryMock,
                    timeMachine: timeMachineMock,
                    generateUuid: generateUuidMock
                }).removeGuard({ userId, guardId });
            }
            catch (error) {
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.prepareKey).toHaveBeenCalledWith({ userId, guardId });
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.getGuard).toHaveBeenCalledWith(redisKey);
                expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledTimes(1);
                expect(guardsRepositoryMock.removeGuard).toHaveBeenCalledWith(redisKey);
                expect(error.status).toBe(500);
                expect(error.message).toBe("Failed to delete guard");
                expect(error.errorCode).toBe("FAILED_TO_DELETE_GUARD");
                return;
            }

            fail("Test should not reach here");
        });
    });
});
