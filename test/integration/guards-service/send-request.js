'use strict';

const got = require('got');

module.exports = ({ method, userId, guardId }) => {
  const BASE_URL = 'http://127.0.0.1:8001/guards';
  const URL = method === 'POST' ? BASE_URL : `${BASE_URL}/${guardId}`;

  return got(URL, {
    method,
    headers: {
      'x-user-id': userId
    },
    responseType: 'json'
  });
};
