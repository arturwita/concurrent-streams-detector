"use strict";

const errorHandler = require("../../../src/error/error-handler");


describe("Error Handler", () => {
    const replyMock = {
        code: jest.fn(status => status),
    };

    it("Should return error with default values", async () => {
        const errorMock = {
            message: "error",
            errorCode: "ERROR_CODE"
        };

        const error = await errorHandler(errorMock, {}, replyMock);

        expect(replyMock.code).toHaveReturnedWith(500);
        expect(error.message).toEqual("Internal server error");
        expect(error.errorCode).toEqual(errorMock.errorCode);
    });

    it("Should return status 400 if error has errors property", async () => {
        const errorMock = { errors: {} };

        await errorHandler(errorMock, {}, replyMock);

        expect(replyMock.code).toHaveReturnedWith(400);
    });

    it("Should return status 400 if error has validation property", async () => {
        const errorMock = { validation: {} };

        await errorHandler(errorMock, {}, replyMock);

        expect(replyMock.code).toHaveReturnedWith(400);
    });

    it("Should return custom status 400 if it was provided in error object", async () => {
        const errorMock = { status: 401 };

        await errorHandler(errorMock, {}, replyMock);

        expect(replyMock.code).toHaveReturnedWith(401);
    });
});
