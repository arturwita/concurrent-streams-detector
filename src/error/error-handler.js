'use strict';

module.exports = async (error, request, reply) => {
  let status;

  switch (true) {
    case !!(error.errors || error.validation): {
      status = 400;
      break;
    }
    case (error.status >= 400): {
      status = error.status;
      break;
    }
    default: {
      status = 500;
      break;
    }
  }

  reply.code(status);

  return {
    message: status === 500 ? 'Internal server error' : error.message,
    errorCode: error.errorCode
  };
};
