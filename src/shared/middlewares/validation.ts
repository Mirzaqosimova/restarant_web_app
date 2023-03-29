import createHttpError from 'http-errors';
import { ApiResponse } from '../response/base.response';
const Validators = require('../../validation/index');

function validation(validator) {
  //! If validator is not exist, throw err
  if (!Validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`);

  return async function (req, res, next) {
    try {
      const validationObject = {};

      Object.entries(req.body).length !== 0
        ? (validationObject['body'] = req.body)
        : '';
      Object.entries(req.params).length !== 0
        ? (validationObject['params'] = req.params)
        : '';
      Object.entries(req.query).length !== 0
        ? (validationObject['query'] = req.query)
        : '';

      await Validators[validator].validateAsync(validationObject);

      next();
    } catch (err) {
      if (err.isJoi) {
        return res.json(ApiResponse.Validation(err.message));
      }
      next(createHttpError(500));
    }
  };
}

module.exports = validation;
