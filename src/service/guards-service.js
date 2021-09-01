"use strict";

const guardsServiceFactory = () => {
    const addGuard = ({ userId }) => {
        return "TODO";
    };

    const refreshGuard = ({ guardId, userId }) => {
        return "TODO";
    };

    const removeGuard = ({ guardId, userId }) => {
        return "TODO";
    };

    return {
        addGuard,
        refreshGuard,
        removeGuard
    }
}

module.exports = guardsServiceFactory;
