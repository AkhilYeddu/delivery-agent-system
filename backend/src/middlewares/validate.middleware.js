const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        res.status(400).json({
          success: false,
          message: 'Validation failed for request parameters or payload.',
          errors: error.errors.map((e) => ({
            field: e.field,
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

module.exports = {
  validateRequest,
};
