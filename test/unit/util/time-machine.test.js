'use strict';

const timeMachineFactory = require('../../../src/utils/time-machine');

describe('Time Machine', () => {
  it('Should shift timestamp for given interval', async () => {
    const configMock = {
      get: jest.fn(() => 60)
    };
    const fakeTimestamp = 1;
    const getCurrentTimestampMock = jest.fn(() => fakeTimestamp);
    const timeMachine = timeMachineFactory({ config: configMock }, getCurrentTimestampMock);

    const expirationTime = timeMachine.getGuardExpirationTime();
    const expectedValue = 61;

    expect(configMock.get).toHaveBeenCalledTimes(1);
    expect(configMock.get).toHaveBeenCalledWith('app.guardExpirationInSeconds');
    expect(getCurrentTimestampMock).toHaveBeenCalledTimes(1);
    expect(expirationTime.getTime()).toBe(expectedValue);
  });
});
