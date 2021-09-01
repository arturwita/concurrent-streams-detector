"use strict";

const { v4: getUuidV4 } = require('uuid');
const loggerFactory = require("../utils/logger");
const CustomError = require("../error/custom-error");
const { GUARD_DOMAIN_ERROR_CODE } = require("../error/error-codes");
const { TIME_UNIT } = require("../utils/time-machine");

const guardsServiceFactory = ({ guardsRepository, timeMachine }) => {
    const logger = loggerFactory("guards-service");

    const { GUARD_EXPIRATION_IN_SECONDS, MAX_GUARDS_COUNT } = process.env;

    const generateUuid = () => getUuidV4();

    const addGuard = async ({ userId }) => {
        const existingGuards = await guardsRepository.getUserGuards(userId);

        if (existingGuards.length === Number.parseInt(MAX_GUARDS_COUNT)) {
            const error = {
                status: 403,
                message: "Reached max guards count",
                errorCode: GUARD_DOMAIN_ERROR_CODE.REACHED_MAX_GUARDS_COUNT
            };

            logger.error(error);
            throw new CustomError(error);
        }

        const guardId = generateUuid();
        const key = guardsRepository.prepareKey({ userId, guardId });

        const expirationTime = timeMachine.addIntervalToCurrentTimestamp({
            value: GUARD_EXPIRATION_IN_SECONDS,
            unit: TIME_UNIT.SECONDS
        });

        const wasSaved = await guardsRepository.saveGuard(key, expirationTime);

        if (!wasSaved) {
            const error = {
                status: 500,
                message: "Failed to create guard",
                errorCode: GUARD_DOMAIN_ERROR_CODE.FAILED_TO_CREATE_GUARD
            };

            logger.error(error);
            throw new CustomError(error);
        }

        return {
            guardId
        };
    };

    const refreshGuard = async ({ guardId, userId }) => {
        const key = guardsRepository.prepareKey({ userId, guardId });
        const guard = await guardsRepository.getGuard(key);

        if (!guard) {
            const error = {
                status: 404,
                message: "Guard does not exist",
                errorCode: GUARD_DOMAIN_ERROR_CODE.GUARD_DOES_NOT_EXIST
            };

            logger.error(error);
            throw new CustomError(error);
        }

        const updatedExpirationTime = timeMachine.addIntervalToCurrentTimestamp({
            value: GUARD_EXPIRATION_IN_SECONDS,
            unit: TIME_UNIT.SECONDS
        });

        const wasSaved = await guardsRepository.saveGuard(key, updatedExpirationTime);

        if (!wasSaved) {
            const error = {
                status: 500,
                message: "Failed to create guard",
                errorCode: GUARD_DOMAIN_ERROR_CODE.FAILED_TO_CREATE_GUARD
            };

            logger.error(error);
            throw new CustomError(error);
        }

        return {
            guardId
        };
    };

    const removeGuard = async ({ guardId, userId }) => {
        const key = guardsRepository.prepareKey({ userId, guardId });
        const guard = await guardsRepository.getGuard(key);

        if (!guard) {
            const error = {
                status: 404,
                message: "Guard does not exist",
                errorCode: GUARD_DOMAIN_ERROR_CODE.GUARD_DOES_NOT_EXIST
            };

            logger.error(error);
            throw new CustomError(error);
        }

        const wasDeleted = await guardsRepository.removeGuard(key);

        if (!wasDeleted) {
            const error = {
                status: 500,
                message: "Failed to delete guard",
                errorCode: GUARD_DOMAIN_ERROR_CODE.FAILED_TO_DELETE_GUARD
            };

            logger.error(error);
            throw new CustomError(error);
        }

        return {
            guardId
        };
    };

    return {
        addGuard,
        refreshGuard,
        removeGuard,
        generateUuid
    }
}

module.exports = guardsServiceFactory;
