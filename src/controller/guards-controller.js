"use strict";

const { USER_ID } = require("../router/headers");

const guardsControllerFactory = ({ guardsService }) => {
    const addGuard = request => {
        const { [USER_ID]: userId } = request.headers;
        return guardsService.addGuard({ userId });
    };

    const refreshGuard = request => {
        const { id: guardId } = request.params;
        const { [USER_ID]: userId } = request.headers;

        return guardsService.refreshGuard({ guardId, userId });
    };

    const removeGuard = request => {
        const { id: guardId } = request.params;
        const { [USER_ID]: userId } = request.headers;

        return guardsService.removeGuard({ guardId, userId });
    };

    return {
        addGuard,
        refreshGuard,
        removeGuard
    };
};

module.exports = guardsControllerFactory;
