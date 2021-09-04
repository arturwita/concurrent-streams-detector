'use strict';

const CustomError = require('../../../src/error/custom-error');
const { HTTP_ERROR_CODE } = require('../../../src/error/error-codes');

describe('Custom Error', () => {
  const defaultError = {
    status: 500,
    message: 'Internal server error',
    errorCode: HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR
  };

  it('Should return error with default values if empty payload was passed', () => {
    const error = new CustomError({});

    expect(error.status).toBe(defaultError.status);
    expect(error.message).toEqual(defaultError.message);
    expect(error.errorCode).toEqual(defaultError.errorCode);
  });

  it('Should return error with custom values', () => {
    const customError = {
      status: 1,
      message: 'error',
      errorCode: 'ERROR_CODE'
    };

    const error = new CustomError(customError);

    expect(error.status).toBe(customError.status);
    expect(error.message).toEqual(customError.message);
    expect(error.errorCode).toEqual(customError.errorCode);
  });

  describe('Partial Error Payloads', () => {
    it('Should set custom status, default message and default errorCode', () => {
      const partialError = {
        status: 1
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(partialError.status);
      expect(error.message).toEqual(defaultError.message);
      expect(error.errorCode).toEqual(defaultError.errorCode);
    });

    it('Should set custom message, default status and default errorCode', () => {
      const partialError = {
        message: 'error'
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(defaultError.status);
      expect(error.message).toEqual(partialError.message);
      expect(error.errorCode).toEqual(defaultError.errorCode);
    });

    it('Should set custom errorCode, default status and default message', () => {
      const partialError = {
        errorCode: 'ERROR_CODE'
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(defaultError.status);
      expect(error.message).toEqual(defaultError.message);
      expect(error.errorCode).toEqual(partialError.errorCode);
    });

    it('Should set custom status, custom message and default errorCode', () => {
      const partialError = {
        status: 1,
        message: 'error'
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(partialError.status);
      expect(error.message).toEqual(partialError.message);
      expect(error.errorCode).toEqual(defaultError.errorCode);
    });

    it('Should set custom status, default message and custom errorCode', () => {
      const partialError = {
        status: 1,
        errorCode: 'ERROR_CODE'
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(partialError.status);
      expect(error.message).toEqual(defaultError.message);
      expect(error.errorCode).toEqual(partialError.errorCode);
    });

    it('Should set custom message, default status and custom errorCode', () => {
      const partialError = {
        message: 'error',
        errorCode: 'ERROR_CODE'
      };

      const error = new CustomError(partialError);

      expect(error.status).toBe(defaultError.status);
      expect(error.message).toEqual(partialError.message);
      expect(error.errorCode).toEqual(partialError.errorCode);
    });
  });
});
