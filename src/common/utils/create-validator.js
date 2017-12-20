import validate from 'validate.js/validate';
import _set from 'lodash/set';

function formatErrors(errors) {
  const formattedErrors = {};

  Object.keys(errors)
    .forEach(errorKey => {
      const errorValue = errors[errorKey];
      _set(formattedErrors, errorKey, errorValue);
    });

  return formattedErrors;
}

const createValidator = (constraints, options = {}) => {
  const defaults = { fullMessages: false };

  return values => {
    if (!values) {
      return {};
    }

    const errors = validate(
      values,
      constraints, { ...defaults, ...options },
    );

    if (!errors) {
      return {};
    }

    return formatErrors(errors);
  };
};

export default createValidator;
