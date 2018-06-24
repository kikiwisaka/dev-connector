const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatorExperienceInput(data) {
  let errors = {};
  data.company = !isEmpty(data.company) ? data.company : '';
  data.title = !isEmpty(data.title) ? data.title : '';
  data.location = !isEmpty(data.location) ? data.location : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (Validator.isEmpty(data.company)) {
    errors.company = 'Company is required';
  }
  if (Validator.isEmpty(data.title)) {
    errors.title = 'Job Title of experience is required';
  }
  if (Validator.isEmpty(data.location)) {
    errors.location = 'Location is required';
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = 'From is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}