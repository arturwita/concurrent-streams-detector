'use strict';

const timeMachineFactory = require('../../../src/utils/time-machine');

describe('Time Machine', () => {
  it('Should shift timestamp for given interval', async () => {
    const FAKE_TIMESTAMP = 1;
    const getCurrentTimestampMock = jest.fn(() => FAKE_TIMESTAMP);
    const timeMachine = timeMachineFactory(getCurrentTimestampMock);

    const expirationTime = timeMachine.getGuardExpirationTime();

    const EXPECTED_VALUE = 61;
    expect(expirationTime.getTime()).toBe(EXPECTED_VALUE);
  });
});
