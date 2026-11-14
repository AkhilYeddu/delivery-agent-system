const {
  validateCreateAgent,
  validateUpdateAgent,
  validateAgentQuery,
} = require('../models/agent.model');

const validateCreate = (req, res, next) => {
  const { isValid, errors, value } = validateCreateAgent(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for request parameters or payload.',
      errors,
    });
  }
  req.body = value;
  next();
};

const validateUpdate = (req, res, next) => {
  const { isValid, errors, value } = validateUpdateAgent(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for request parameters or payload.',
      errors,
    });
  }
  req.body = value;
  next();
};

const validateQuery = (req, res, next) => {
  const { value } = validateAgentQuery(req.query);
  req.query = value;
  next();
};

module.exports = {
  validateCreate,
  validateUpdate,
  validateQuery,
};
