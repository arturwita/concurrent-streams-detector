'use strict';

const verifyUserId = require('../../../src/middleware/verify-user-id');
const { USER_ID } = require('../../../src/router/headers');
const { MIDDLEWARE_ERROR_CODE, HTTP_ERROR_CODE } = require('../../../src/error/error-codes');

describe('Verify User Id', () => {
  it('Should throw if user id was not passed in request headers', async () => {
    const requestMock = { headers: {} };

    try {
      await verifyUserId(requestMock);
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.message).toEqual(`${USER_ID} header is required`);
      expect(error.errorCode).toEqual(MIDDLEWARE_ERROR_CODE.MISSING_HEADER);
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

    try {
      await verifyUserId(requestMock);
    } catch (error) {
      expect(error.status).toBe(401);
      expect(error.message).toEqual('Unauthorized');
      expect(error.errorCode).toEqual(HTTP_ERROR_CODE.UNAUTHORIZED);
      return;
    }

    fail('Test should not reach here');
  });
});
