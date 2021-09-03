'use strict';

const config = require('config');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv(config.get('ajv'));
addFormats(ajv);

module.exports = ({ schema }) => ajv.compile(schema);
