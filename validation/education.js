const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatorEducationInput(data) {
  let errors = {};
  data.school = !isEmpty(data.school) ? data.school : '';
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (Validator.isEmpty(data.school)) {
    errors.school = 'School is required';
  }
  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = 'Field of study is required';
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = 'From is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}