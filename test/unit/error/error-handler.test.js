'use strict';

const errorHandlerFactory = require('../../../src/error/error-handler');

describe('Error Handler', () => {
  const replyMock = {
    code: jest.fn(status => status),
  };

  const loggerMock = {
    error: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const errorHandler = errorHandlerFactory({ logger: loggerMock });

  it('Should return error with default values', async () => {
    const errorMock = {
      message: 'error message',
      errorCode: 'ERROR_CODE'
    };

    const error = await errorHandler(errorMock, {}, replyMock);
    const expectedStatus = 500;

    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(errorMock);
    expect(replyMock.code).toHaveReturnedWith(expectedStatus);
    expect(replyMock.code).toHaveBeenCalledWith(expectedStatus);
    expect(error.message).toEqual('Internal server error');
    expect(error.errorCode).toEqual(errorMock.errorCode);
  });

  it('Should return status 400 if error has errors property', async () => {
    const errorMock = {
      message: 'error message',
      errorCode: 'ERROR_CODE',
      errors: {}
    };

    const error = await errorHandler(errorMock, {}, replyMock);

    const expectedStatus = 400;
    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(errorMock);
    expect(replyMock.code).toHaveReturnedWith(expectedStatus);
    expect(replyMock.code).toHaveBeenCalledWith(expectedStatus);
    expect(error.message).toEqual(errorMock.message);
    expect(error.errorCode).toEqual(errorMock.errorCode);
  });

  it('Should return status 400 if error has validation property', async () => {
    const errorMock = {
      message: 'error message',
      errorCode: 'ERROR_CODE',
      validation: {}
    };

    const error = await errorHandler(errorMock, {}, replyMock);
    const expectedStatus = 400;

    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(errorMock);
    expect(replyMock.code).toHaveReturnedWith(expectedStatus);
    expect(replyMock.code).toHaveBeenCalledWith(expectedStatus);
    expect(error.message).toEqual(errorMock.message);
    expect(error.errorCode).toEqual(errorMock.errorCode);
  });

  it('Should return custom status if it was provided in error object', async () => {
    const expectedStatus = 401;
    const errorMock = {
      status: expectedStatus,
      message: 'error message',
      errorCode: 'ERROR_CODE',
    };

    const error = await errorHandler(errorMock, {}, replyMock);

    expect(loggerMock.error).toHaveBeenCalledTimes(1);
    expect(loggerMock.error).toHaveBeenCalledWith(errorMock);
    expect(replyMock.code).toHaveReturnedWith(expectedStatus);
    expect(error.message).toEqual(errorMock.message);
    expect(error.errorCode).toEqual(errorMock.errorCode);
  });
});
