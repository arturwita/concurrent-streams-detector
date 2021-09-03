'use strict';

const { USER_ID } = require('../router/headers');
const CustomError = require('../error/custom-error');
const { MIDDLEWARE_ERROR_CODE, HTTP_ERROR_CODE } = require('../error/error-codes');
const validatorCompiler = require('../validator/validator-compiler');
const userIdSchema = require('../router/validation-schemas/user-id-schema');

module.exports = ({ logger }) => async function (request) {
  const { [USER_ID]: userId } = request.headers;

  if (typeof userId !== 'string') {
    const error = {
      status: 400,
      message: `${USER_ID} header is required`,
      errorCode: MIDDLEWARE_ERROR_CODE.MISSING_HEADER
    };

    logger.error(error);
    throw new CustomError(error);
  }

  const validate = validatorCompiler({ schema: userIdSchema });
  const isValid = validate(userId);

  if (!isValid) {
    const error = {
      status: 401,
      message: 'Unauthorized',
      errorCode: HTTP_ERROR_CODE.UNAUTHORIZED
    };

    logger.error(error);
    throw new CustomError(error);
  }
};
