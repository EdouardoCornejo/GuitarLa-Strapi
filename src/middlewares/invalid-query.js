'use strict';

const { ValidationError } = require('@strapi/utils').errors;

// Strapi 4.5 does not validate ids, filters or sort fields before querying,
// so malformed input reaches PostgreSQL (or the query builder) and ends as a 500.
const POSTGRES_INVALID_INPUT_CODES = new Set([
  '22P02', // invalid_text_representation: e.g. GET /api/guitarras/abc
  '42703', // undefined_column: e.g. filters[unknown]=1
]);
const QUERY_BUILDER_ERRORS = [
  /^Undefined attribute level operator/, // e.g. filters[precio][$foo]=1
  /^Attribute .+ not found on model/, // e.g. sort=unknown:asc
];

const isInvalidQueryError = (error) =>
  POSTGRES_INVALID_INPUT_CODES.has(error.code) ||
  QUERY_BUILDER_ERRORS.some((pattern) => pattern.test(error.message));

module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (isInvalidQueryError(error)) {
      throw new ValidationError('Invalid query parameters');
    }
    throw error;
  }
};
