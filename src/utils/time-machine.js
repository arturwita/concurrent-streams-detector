"use strict";

const config = require("config");

const timeMachineFactory = (getCurrentTimestamp = Date.now) => {
    const EXPIRATION = Number.parseInt(config.get("app.guardExpirationInSeconds"));

    const getGuardExpirationTime = () => {
        const shiftedTimestamp = getCurrentTimestamp() + EXPIRATION;
        return new Date(shiftedTimestamp);
    }

    return {
        getGuardExpirationTime,
    };
};

module.exports = timeMachineFactory;
