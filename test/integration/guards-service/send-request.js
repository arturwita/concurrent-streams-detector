'use strict';

const got = require('got');

const baseMethods = ['POST', 'OPTIONS'];
const BASE_URL = 'http://127.0.0.1:8001/guards';

module.exports = ({ method, userId, guardId }) => {
  const URL = baseMethods.includes(method) ? BASE_URL : `${BASE_URL}/${guardId}`;

  return got(URL, {
    method,
    headers: {
      'x-user-id': userId
    },
    responseType: 'json'
  });
};
