const validator = require('validator');

const VALID_STATUSES = ['active', 'inactive', 'on_delivery', 'suspended'];
const VALID_VEHICLE_TYPES = ['bike', 'scooter', 'car', 'van', 'electric_bike', 'walker'];
const VALID_SORT_COLUMNS = ['created_at', 'full_name', 'rating', 'completed_deliveries'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

function createValidator(validateFn) {
  return {
    validate: validateFn,
    parseAsync: async (data) => {
      const { isValid, errors, value } = validateFn(data);
      if (!isValid) {
        const error = new Error('Validation failed');
        error.errors = errors;
        throw error;
      }
      return value;
    },
    parse: (data) => {
      const { isValid, errors, value } = validateFn(data);
      if (!isValid) {
        const error = new Error('Validation failed');
        error.errors = errors;
        throw error;
      }
      return value;
    },
  };
}

function validateCreateAgent(data = {}) {
  const errors = [];
  const value = { ...data };

  // 1. full_name
  if (value.full_name === undefined || value.full_name === null || typeof value.full_name !== 'string') {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  } else {
    value.full_name = validator.trim(value.full_name);
    if (!validator.isLength(value.full_name, { min: 2 })) {
      errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters' });
    } else if (!validator.isLength(value.full_name, { max: 100 })) {
      errors.push({ field: 'full_name', message: 'Full name must be at most 100 characters' });
    }
  }

  // 2. phone
  if (value.phone === undefined || value.phone === null || typeof value.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else {
    value.phone = validator.trim(value.phone);
    if (!validator.isLength(value.phone, { min: 7 })) {
      errors.push({ field: 'phone', message: 'Phone number is too short' });
    } else if (!validator.isLength(value.phone, { max: 25 })) {
      errors.push({ field: 'phone', message: 'Phone number is too long' });
    } else if (!/^[+0-9\s\-()]+$/.test(value.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }
  }

  // 3. email
  if (value.email === undefined || value.email === null || typeof value.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    value.email = validator.trim(value.email).toLowerCase();
    if (!validator.isEmail(value.email)) {
      errors.push({ field: 'email', message: 'Invalid email address format' });
    }
  }

  // 4. service_area
  if (value.service_area === undefined || value.service_area === null || typeof value.service_area !== 'string') {
    errors.push({ field: 'service_area', message: 'Service area is required' });
  } else {
    value.service_area = validator.trim(value.service_area);
    if (!validator.isLength(value.service_area, { min: 2 })) {
      errors.push({ field: 'service_area', message: 'Service area must be at least 2 characters' });
    } else if (!validator.isLength(value.service_area, { max: 100 })) {
      errors.push({ field: 'service_area', message: 'Service area must be at most 100 characters' });
    }
  }

  // 5. status
  if (value.status === undefined || value.status === null || value.status === '') {
    value.status = 'active';
  } else if (!validator.isIn(String(value.status), VALID_STATUSES)) {
    errors.push({ field: 'status', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  // 6. vehicle_type
  if (value.vehicle_type === undefined || value.vehicle_type === null || value.vehicle_type === '') {
    value.vehicle_type = 'bike';
  } else if (!validator.isIn(String(value.vehicle_type), VALID_VEHICLE_TYPES)) {
    errors.push({
      field: 'vehicle_type',
      message: `Invalid vehicle type. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`,
    });
  }

  // 7. rating
  if (value.rating === undefined || value.rating === null) {
    value.rating = 5.0;
  } else {
    const num = Number(value.rating);
    if (isNaN(num) || num < 1.0 || num > 5.0) {
      errors.push({ field: 'rating', message: 'Rating must be a number between 1.0 and 5.0' });
    } else {
      value.rating = num;
    }
  }

  // 8. completed_deliveries
  if (value.completed_deliveries === undefined || value.completed_deliveries === null) {
    value.completed_deliveries = 0;
  } else {
    const num = Number(value.completed_deliveries);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
      errors.push({ field: 'completed_deliveries', message: 'Completed deliveries must be a non-negative integer' });
    } else {
      value.completed_deliveries = num;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value,
  };
}

function validateUpdateAgent(data = {}) {
  const errors = [];
  const value = { ...data };

  if (value.full_name !== undefined) {
    if (typeof value.full_name !== 'string') {
      errors.push({ field: 'full_name', message: 'Full name must be a string' });
    } else {
      value.full_name = validator.trim(value.full_name);
      if (!validator.isLength(value.full_name, { min: 2 })) {
        errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters' });
      } else if (!validator.isLength(value.full_name, { max: 100 })) {
        errors.push({ field: 'full_name', message: 'Full name must be at most 100 characters' });
      }
    }
  }

  if (value.phone !== undefined) {
    if (typeof value.phone !== 'string') {
      errors.push({ field: 'phone', message: 'Phone number must be a string' });
    } else {
      value.phone = validator.trim(value.phone);
      if (!validator.isLength(value.phone, { min: 7 })) {
        errors.push({ field: 'phone', message: 'Phone number is too short' });
      } else if (!validator.isLength(value.phone, { max: 25 })) {
        errors.push({ field: 'phone', message: 'Phone number is too long' });
      } else if (!/^[+0-9\s\-()]+$/.test(value.phone)) {
        errors.push({ field: 'phone', message: 'Invalid phone number format' });
      }
    }
  }

  if (value.email !== undefined) {
    if (typeof value.email !== 'string') {
      errors.push({ field: 'email', message: 'Email must be a string' });
    } else {
      value.email = validator.trim(value.email).toLowerCase();
      if (!validator.isEmail(value.email)) {
        errors.push({ field: 'email', message: 'Invalid email address format' });
      }
    }
  }

  if (value.service_area !== undefined) {
    if (typeof value.service_area !== 'string') {
      errors.push({ field: 'service_area', message: 'Service area must be a string' });
    } else {
      value.service_area = validator.trim(value.service_area);
      if (!validator.isLength(value.service_area, { min: 2 })) {
        errors.push({ field: 'service_area', message: 'Service area must be at least 2 characters' });
      } else if (!validator.isLength(value.service_area, { max: 100 })) {
        errors.push({ field: 'service_area', message: 'Service area must be at most 100 characters' });
      }
    }
  }

  if (value.status !== undefined) {
    if (!validator.isIn(String(value.status), VALID_STATUSES)) {
      errors.push({ field: 'status', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
  }

  if (value.vehicle_type !== undefined) {
    if (!validator.isIn(String(value.vehicle_type), VALID_VEHICLE_TYPES)) {
      errors.push({
        field: 'vehicle_type',
        message: `Invalid vehicle type. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`,
      });
    }
  }

  if (value.rating !== undefined) {
    const num = Number(value.rating);
    if (isNaN(num) || num < 1.0 || num > 5.0) {
      errors.push({ field: 'rating', message: 'Rating must be a number between 1.0 and 5.0' });
    } else {
      value.rating = num;
    }
  }

  if (value.completed_deliveries !== undefined) {
    const num = Number(value.completed_deliveries);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
      errors.push({ field: 'completed_deliveries', message: 'Completed deliveries must be a non-negative integer' });
    } else {
      value.completed_deliveries = num;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value,
  };
}

function validateAgentQuery(data = {}) {
  const value = { ...data };

  // page: coerce to positive integer, default 1
  const pageNum = parseInt(value.page, 10);
  value.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;

  // limit: coerce to positive integer, max 100, default 10
  const limitNum = parseInt(value.limit, 10);
  value.limit = !isNaN(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 10;

  // status: validate against enum or clear
  if (value.status && value.status !== 'all') {
    value.status = validator.isIn(String(value.status), VALID_STATUSES) ? String(value.status) : undefined;
  } else {
    value.status = undefined;
  }

  // service_area
  if (value.service_area && value.service_area !== 'all' && typeof value.service_area === 'string') {
    value.service_area = validator.trim(value.service_area);
  } else {
    value.service_area = undefined;
  }

  // search
  if (value.search && typeof value.search === 'string') {
    value.search = validator.trim(value.search);
  } else {
    value.search = undefined;
  }

  // sortBy
  if (value.sortBy && validator.isIn(String(value.sortBy), VALID_SORT_COLUMNS)) {
    value.sortBy = String(value.sortBy);
  } else {
    value.sortBy = 'created_at';
  }

  // sortOrder
  if (value.sortOrder && validator.isIn(String(value.sortOrder).toLowerCase(), VALID_SORT_ORDERS)) {
    value.sortOrder = String(value.sortOrder).toLowerCase();
  } else {
    value.sortOrder = 'desc';
  }

  return {
    isValid: true,
    errors: [],
    value,
  };
}

const CreateAgentSchema = createValidator(validateCreateAgent);
const UpdateAgentSchema = createValidator(validateUpdateAgent);
const AgentQuerySchema = createValidator(validateAgentQuery);

module.exports = {
  VALID_STATUSES,
  VALID_VEHICLE_TYPES,
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentQuerySchema,
  validateCreateAgent,
  validateUpdateAgent,
  validateAgentQuery,
};
