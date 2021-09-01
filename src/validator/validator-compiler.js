"use strict";

const Ajv = require('ajv');
const ajvConfig = require("../../config/ajv-config");
const addFormats = require("ajv-formats");

const ajv = new Ajv(ajvConfig);
addFormats(ajv);

module.exports = ({ schema }) => ajv.compile(schema);
