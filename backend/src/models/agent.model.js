const { z } = require('zod');

const AgentStatusSchema = z.enum(['active', 'inactive', 'on_delivery', 'suspended']);
const VehicleTypeSchema = z.enum(['bike', 'scooter', 'car', 'van', 'electric_bike', 'walker']);

const CreateAgentSchema = z.object({
  full_name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(7, 'Phone number is too short')
    .max(25, 'Phone number is too long')
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  service_area: z
    .string({ required_error: 'Service area is required' })
    .trim()
    .min(2, 'Service area must be at least 2 characters')
    .max(100, 'Service area must be at most 100 characters'),
  status: AgentStatusSchema.default('active'),
  vehicle_type: VehicleTypeSchema.default('bike'),
  rating: z.number().min(1.0).max(5.0).optional().default(5.0),
  completed_deliveries: z.number().int().nonnegative().optional().default(0),
});

const UpdateAgentSchema = CreateAgentSchema.partial();

const AgentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: AgentStatusSchema.optional(),
  service_area: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'full_name', 'rating', 'completed_deliveries']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  AgentStatusSchema,
  VehicleTypeSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentQuerySchema,
};

