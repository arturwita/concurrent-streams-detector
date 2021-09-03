'use strict';

const sendRequest = require('./send-request');

describe('CORS', () => {
  it('Should be enabled', async () => {
    const { headers, statusCode } = await sendRequest({ method: 'OPTIONS' });

    expect(statusCode).toBe(204);
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['access-control-allow-methods']).toBe('POST, PATCH, DELETE');
    expect(headers['access-control-allow-headers']).toBe('content-type, x-user-id');
  });
});
