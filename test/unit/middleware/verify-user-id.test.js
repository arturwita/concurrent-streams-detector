'use strict';

const verifyUserIdFactory = require('../../../src/middleware/verify-user-id');
const { USER_ID } = require('../../../src/router/headers');

describe('Verify User Id', () => {
  const loggerMock = {
    error: jest.fn()
  };

  const verifyUserId = verifyUserIdFactory({ logger: loggerMock });

  const assertError = ({ error, expectedError }) => {
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(expectedError);
    expect(error.status).toBe(expectedError.status);
    expect(error.message).toEqual(expectedError.message);
    expect(error.errorCode).toEqual(expectedError.errorCode);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should throw if user id was not passed in request headers', async () => {
    const requestMock = { headers: {} };
    const expectedError = {
      status: 400,
      message: `${USER_ID} header is required`,
      errorCode: 'MISSING_HEADER'
    };

    try {
      await verifyUserId(requestMock);
    } catch (error) {
      assertError({ error, expectedError });
      return;
    }

    fail('Test should not reach here');
  });

  it('Should throw if user id does not match given schema', async () => {
    const requestMock = {
      headers: {
        [USER_ID]: 'abc'
      }
    };

    const expectedError = {
      status: 401,
      message: 'Unauthorized',
      errorCode: 'UNAUTHORIZED'
    };

    try {
      await verifyUserId(requestMock);
    } catch (error) {
      assertError({ error, expectedError });
      return;
    }

    fail('Test should not reach here');
  });
});
