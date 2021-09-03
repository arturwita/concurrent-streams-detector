'use strict';

const timeMachineFactory = ({ config }, getCurrentTimestamp = Date.now) => {
  const EXPIRATION = Number.parseInt(config.get('app.guardExpirationInSeconds'), 10);

  const getGuardExpirationTime = () => {
    const shiftedTimestamp = getCurrentTimestamp() + EXPIRATION;
    return new Date(shiftedTimestamp);
  };

  return {
    getGuardExpirationTime,
  };
};

module.exports = timeMachineFactory;
