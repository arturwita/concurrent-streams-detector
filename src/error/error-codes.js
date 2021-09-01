"use strict";

const GUARD_DOMAIN_ERROR_CODE = {
    FAILED_TO_CREATE_GUARD: "FAILED_TO_CREATE_GUARD",
    FAILED_TO_DELETE_GUARD: "FAILED_TO_DELETE_GUARD",
    REACHED_MAX_GUARDS_COUNT: "REACHED_MAX_GUARDS_COUNT",
    GUARD_DOES_NOT_EXIST: "GUARD_DOES_NOT_EXIST"
};

const MIDDLEWARE_ERROR_CODE = {
    MISSING_HEADER: "MISSING_HEADER"
};

const HTTP_ERROR_CODE = {
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED"
};

module.exports = {
    GUARD_DOMAIN_ERROR_CODE,
    MIDDLEWARE_ERROR_CODE,
    HTTP_ERROR_CODE
};