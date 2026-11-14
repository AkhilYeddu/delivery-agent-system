const validator = require('validator');

const VALID_STATUSES = ['active', 'inactive', 'on_delivery', 'suspended'];
const VALID_VEHICLE_TYPES = ['bike', 'scooter', 'car', 'van', 'electric_bike', 'walker'];
const VALID_SORT_COLUMNS = ['created_at', 'full_name', 'rating', 'completed_deliveries'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

// Single validation rule definition per field
function validateField(field, val, isRequired = false) {
  if (val === undefined || val === null || val === '') {
    return isRequired ? `${field.replace('_', ' ')} is required` : null;
  }

  const str = String(val).trim();

  switch (field) {
    case 'full_name':
      if (str.length < 2) return 'Full name must be at least 2 characters';
      if (str.length > 100) return 'Full name must be at most 100 characters';
      break;

    case 'phone':
      if (str.length < 7) return 'Phone number is too short';
      if (str.length > 25) return 'Phone number is too long';
      if (!/^[+0-9\s\-()]+$/.test(str)) return 'Invalid phone number format';
      break;

    case 'email':
      if (!validator.isEmail(str)) return 'Invalid email address format';
      break;

    case 'service_area':
      if (str.length < 2) return 'Service area must be at least 2 characters';
      if (str.length > 100) return 'Service area must be at most 100 characters';
      break;

    case 'status':
      if (!VALID_STATUSES.includes(str)) {
        return `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
      }
      break;

    case 'vehicle_type':
      if (!VALID_VEHICLE_TYPES.includes(str)) {
        return `Invalid vehicle type. Must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`;
      }
      break;

    case 'rating': {
      const num = Number(val);
      if (isNaN(num) || num < 1.0 || num > 5.0) {
        return 'Rating must be a number between 1.0 and 5.0';
      }
      break;
    }

    case 'completed_deliveries': {
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return 'Completed deliveries must be a non-negative integer';
      }
      break;
    }
  }

  return null;
}

// Validate Create: checks required + optional fields and sets defaults
function validateCreateAgent(data = {}) {
  const errors = [];
  const value = { ...data };
  const required = ['full_name', 'phone', 'email', 'service_area'];
  const optional = ['status', 'vehicle_type', 'rating', 'completed_deliveries'];

  [...required, ...optional].forEach((field) => {
    const err = validateField(field, value[field], required.includes(field));
    if (err) errors.push({ field, message: err });
  });

  if (value.full_name) value.full_name = validator.trim(value.full_name);
  if (value.email) value.email = validator.trim(value.email).toLowerCase();
  if (value.phone) value.phone = validator.trim(value.phone);
  if (value.service_area) value.service_area = validator.trim(value.service_area);
  value.status = value.status || 'active';
  value.vehicle_type = value.vehicle_type || 'bike';
  value.rating = value.rating !== undefined ? Number(value.rating) : 5.0;
  value.completed_deliveries = value.completed_deliveries !== undefined ? Number(value.completed_deliveries) : 0;

  return { isValid: errors.length === 0, errors, value };
}

// Validate Update: checks only fields present in payload
function validateUpdateAgent(data = {}) {
  const errors = [];
  const value = { ...data };

  Object.keys(value).forEach((field) => {
    const err = validateField(field, value[field], false);
    if (err) errors.push({ field, message: err });
  });

  if (value.full_name) value.full_name = validator.trim(value.full_name);
  if (value.email) value.email = validator.trim(value.email).toLowerCase();
  if (value.phone) value.phone = validator.trim(value.phone);
  if (value.service_area) value.service_area = validator.trim(value.service_area);
  if (value.rating !== undefined) value.rating = Number(value.rating);
  if (value.completed_deliveries !== undefined) value.completed_deliveries = Number(value.completed_deliveries);

  return { isValid: errors.length === 0, errors, value };
}

// Validate Query: handles pagination coercion and safe filters
function validateAgentQuery(data = {}) {
  const value = { ...data };
  const page = parseInt(value.page, 10);
  const limit = parseInt(value.limit, 10);

  value.page = !isNaN(page) && page > 0 ? page : 1;
  value.limit = !isNaN(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  value.status = value.status && value.status !== 'all' && VALID_STATUSES.includes(value.status) ? String(value.status) : undefined;
  value.service_area = value.service_area && value.service_area !== 'all' ? validator.trim(String(value.service_area)) : undefined;
  value.search = value.search ? validator.trim(String(value.search)) : undefined;
  value.sortBy = VALID_SORT_COLUMNS.includes(value.sortBy) ? String(value.sortBy) : 'created_at';
  value.sortOrder = (value.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { isValid: true, errors: [], value };
}

module.exports = {
  VALID_STATUSES,
  VALID_VEHICLE_TYPES,
  validateCreateAgent,
  validateUpdateAgent,
  validateAgentQuery,
};
