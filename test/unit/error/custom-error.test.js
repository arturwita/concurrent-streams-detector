"use strict";

const CustomError = require("../../../src/error/custom-error");
const { HTTP_ERROR_CODE } = require("../../../src/error/error-codes");


describe("Custom Error", () => {
    const DEFAULT_ERROR_PAYLOAD = {
        status: 500,
        message: "Internal server error",
        errorCode: HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR
    };

    it("Should return error with default values if empty payload was passed", () => {
        const error = new CustomError({});

        expect(error.status).toBe(DEFAULT_ERROR_PAYLOAD.status);
        expect(error.message).toEqual(DEFAULT_ERROR_PAYLOAD.message);
        expect(error.errorCode).toEqual(DEFAULT_ERROR_PAYLOAD.errorCode);
    });

    it("Should return error with custom values", () => {
        const CUSTOM_ERROR_PAYLOAD = {
            status: 1,
            message: "error",
            errorCode: "ERROR_CODE"
        };

        const error = new CustomError(CUSTOM_ERROR_PAYLOAD);

        expect(error.status).toBe(CUSTOM_ERROR_PAYLOAD.status);
        expect(error.message).toEqual(CUSTOM_ERROR_PAYLOAD.message);
        expect(error.errorCode).toEqual(CUSTOM_ERROR_PAYLOAD.errorCode);
    });

    describe("Partial Error Payloads", () => {
        it("Should set custom status, default message and default errorCode", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                status: 1
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(PARTIAL_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(DEFAULT_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(DEFAULT_ERROR_PAYLOAD.errorCode);
        });

        it("Should set custom message, default status and default errorCode", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                message: "error"
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(DEFAULT_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(PARTIAL_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(DEFAULT_ERROR_PAYLOAD.errorCode);
        });

        it("Should set custom errorCode, default status and default message", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                errorCode: "ERROR_CODE"
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(DEFAULT_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(DEFAULT_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(PARTIAL_ERROR_PAYLOAD.errorCode);
        });

        it("Should set custom status, custom message and default errorCode", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                status: 1,
                message: "error"
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(PARTIAL_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(PARTIAL_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(DEFAULT_ERROR_PAYLOAD.errorCode);
        });

        it("Should set custom status, default message and custom errorCode", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                status: 1,
                errorCode: "ERROR_CODE"
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(PARTIAL_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(DEFAULT_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(PARTIAL_ERROR_PAYLOAD.errorCode);
        });

        it("Should set custom message, default status and custom errorCode", () => {
            const PARTIAL_ERROR_PAYLOAD = {
                message: "error",
                errorCode: "ERROR_CODE"
            };

            const error = new CustomError(PARTIAL_ERROR_PAYLOAD);

            expect(error.status).toBe(DEFAULT_ERROR_PAYLOAD.status);
            expect(error.message).toEqual(PARTIAL_ERROR_PAYLOAD.message);
            expect(error.errorCode).toEqual(PARTIAL_ERROR_PAYLOAD.errorCode);
        });
    });
});
