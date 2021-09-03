'use strict';

const sleep = async timeout => new Promise(resolve => setInterval(() => resolve(), timeout));

module.exports = {
  sleep
};
