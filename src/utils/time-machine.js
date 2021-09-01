"use strict";

const dayjs = require("dayjs");

const TIME_UNIT = {
    SECONDS: "seconds"
};

const timeMachineFactory = () => {
    const addIntervalToCurrentTimestamp = ({ value, unit }) => dayjs().add(value, unit).toISOString();

    return {
        addIntervalToCurrentTimestamp,
    };
};

module.exports = {
    timeMachineFactory,
    TIME_UNIT
};
