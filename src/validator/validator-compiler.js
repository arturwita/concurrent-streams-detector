"use strict";

const Ajv = require('ajv');
const addFormats = require("ajv-formats")

const ajv = new Ajv({
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
});
addFormats(ajv);

module.exports = ({ schema }) => ajv.compile(schema);
