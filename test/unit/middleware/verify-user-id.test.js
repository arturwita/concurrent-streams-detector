'use strict';

const verifyUserIdFactory = require('../../../src/middleware/verify-user-id');
const { USER_ID } = require('../../../src/router/headers');

describe('Verify User Id', () => {
  const logger = {
    error: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const verifyUserId = verifyUserIdFactory({ logger });

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
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(expectedError);
      expect(error.status).toBe(expectedError.status);
      expect(error.message).toEqual(expectedError.message);
      expect(error.errorCode).toEqual(expectedError.errorCode);
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
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(expectedError);
      expect(error.status).toBe(expectedError.status);
      expect(error.message).toEqual(expectedError.message);
      expect(error.errorCode).toEqual(expectedError.errorCode);
      return;
    }

    fail('Test should not reach here');
  });
});
