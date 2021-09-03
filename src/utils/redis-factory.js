'use strict';

const Redis = require('ioredis');

module.exports = ({ config }) => new Redis(config.get('redis'));
