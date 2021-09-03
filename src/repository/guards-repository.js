"use strict";

const config = require("config");

const guardsRepositoryFactory = redis => {
    const TTL = config.get("redis.ttlInSeconds");
    const SUCCESSFUL_SAVE_STATUS = "OK";
    const KEY_SEPARATOR = "_";

    const prepareKey = ({ userId, guardId }) => `${userId}${KEY_SEPARATOR}${guardId}`;

    const saveGuard = async (key, value) => {
        const status = await redis.setex(key, TTL, value);
        return status === SUCCESSFUL_SAVE_STATUS;
    };

    const getGuard = async key => await redis.get(key);

    const getUserGuards = async userId => {
        const userGuardsRegex = `${userId}${KEY_SEPARATOR}*`;
        return await redis.keys(userGuardsRegex);
    };

    const removeGuard = async key => {
        const deletedItemsCount = await redis.del(key);
        return !!deletedItemsCount;
    };

    return {
        prepareKey,
        saveGuard,
        getUserGuards,
        getGuard,
        removeGuard
    };
};

module.exports = guardsRepositoryFactory;
