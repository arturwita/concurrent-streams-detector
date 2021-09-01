"use strict";

const { HTTP_ERROR_CODE } = require("./error-codes");

class CustomError extends Error {
    constructor({ status, message, errorCode }) {
        super();

        const defaultStatus = status ? status : 500;
        const defaultMessage = message ? message : "Internal server error";
        const defaultErrorCode = errorCode ? errorCode : HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR;

        Object.assign(this, {
            status: defaultStatus,
            message: defaultMessage,
            errorCode: defaultErrorCode
        })
    }
}

module.exports = CustomError;
