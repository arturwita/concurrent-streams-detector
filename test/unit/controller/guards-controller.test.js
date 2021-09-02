"use strict";

const guardsControllerFactory = require("../../../src/controller/guards-controller");

describe("Guards Controller", () => {
    const requestMock = {
        headers: {
            "x-user-id": 1
        },
        params: {
            id: "abc"
        }
    };

    const replySendMock = jest.fn();
    const replyCodeMock = jest.fn(() => ({
        send: replySendMock,
    }));

    const replyMock = {
        code: replyCodeMock,
    };

    const guardsServiceMock = {
        addGuard: jest.fn(),
        refreshGuard: jest.fn(),
        removeGuard: jest.fn(),
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    const guardsController = guardsControllerFactory(guardsServiceMock);

    describe("Add Guard", () => {
        it("Should call addGuard with given arguments", () => {
            guardsController.addGuard(requestMock);
            expect(guardsServiceMock.addGuard).toHaveBeenCalledWith({
                userId: requestMock.headers["x-user-id"]
            });
        });
    });

    describe("Refresh Guard", () => {
        it("Should call refreshGuard with given arguments", async () => {
            await guardsController.refreshGuard(requestMock, replyMock);
            expect(guardsServiceMock.refreshGuard).toHaveBeenCalledWith({
                userId: requestMock.headers["x-user-id"],
                guardId: requestMock.params.id
            });
        });
    });

    describe("Remove Guard", () => {
        it("Should call removeGuard with given arguments", async () => {
            await guardsController.removeGuard(requestMock, replyMock);
            expect(guardsServiceMock.removeGuard).toHaveBeenCalledWith({
                userId: requestMock.headers["x-user-id"],
                guardId: requestMock.params.id
            });
        });
    });
});

