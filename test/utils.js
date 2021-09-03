"use strict";

const utils = async timeout => await new Promise(resolve => setInterval(() => resolve(), timeout));

module.exports = {
    sleep: utils
};
