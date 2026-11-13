const { getDb } = require('../config/db');
const { getCache } = require('../config/redis');
const { config } = require('../config/env');

function generateAgentId() {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AGT-${timestampPart}-${randomPart}`;
}

/**
 * Retrieves paginated list of delivery agents with filtering and search.
 * Utilizes Redis cache-aside strategy.
 */
async function getAgents(params) {
  const cache = getCache();
  const {
    page = 1,
    limit = 10,
    status,
    service_area,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params || {};

  const cacheKey = `agents:list:p=${page}:l=${limit}:st=${status || ''}:area=${encodeURIComponent(
    service_area || ''
  )}:q=${encodeURIComponent(search || '')}:sb=${sortBy}:so=${sortOrder}`;

  // 1. Check Redis Cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      return {
        ...parsed,
        fromCache: true,
      };
    } catch {
      // Fall through to DB on JSON parse error
    }
  }

  // 2. Cache Miss: Query PostgreSQL
  const db = await getDb();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  if (service_area) {
    conditions.push(`service_area ILIKE $${paramIndex++}`);
    values.push(`%${service_area}%`);
  }

  if (search && search.trim() !== '') {
    conditions.push(
      `(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR service_area ILIKE $${paramIndex} OR id ILIKE $${paramIndex})`
    );
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total count query
  const countSql = `SELECT COUNT(*)::int as count FROM delivery_agents ${whereClause}`;
  const countResult = await db.query(countSql, values);
  const total = countResult.rows[0]?.count ? parseInt(countResult.rows[0].count, 10) : 0;

  // Data query with pagination and safe sort
  const validSortColumns = ['created_at', 'full_name', 'rating', 'completed_deliveries'];
  const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const dataSql = `
    SELECT * FROM delivery_agents
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const dataResult = await db.query(dataSql, [...values, limit, offset]);
  const agents = dataResult.rows;

  const result = {
    data: agents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
    fromCache: false,
  };

  // 3. Write to Redis cache with TTL
  await cache.set(cacheKey, JSON.stringify(result), config.redis.ttlList);

  return result;
}

/**
 * Retrieves single agent by ID with Redis cache-aside.
 */
async function getAgentById(id) {
  const cache = getCache();
  const cacheKey = `agents:detail:${id}`;

  // 1. Check Redis Cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    try {
      const agent = JSON.parse(cached);
      return { agent, fromCache: true };
    } catch {
      // Fallback to DB
    }
  }

  // 2. Query PostgreSQL
  const db = await getDb();
  const query = 'SELECT * FROM delivery_agents WHERE id = $1 LIMIT 1';
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    return { agent: null, fromCache: false };
  }

  const agent = result.rows[0];

  // 3. Populate Redis cache
  await cache.set(cacheKey, JSON.stringify(agent), config.redis.ttlDetail);

  return { agent, fromCache: false };
}

/**
 * Creates a new delivery agent.
 * Invalidates Redis caches for list and stats to maintain consistency.
 */
async function createAgent(input) {
  const db = await getDb();
  const cache = getCache();

  // Check unique email
  const existing = await db.query('SELECT id FROM delivery_agents WHERE email = $1 LIMIT 1', [input.email]);
  if (existing.rows.length > 0) {
    const err = new Error(`An agent with email "${input.email}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const id = generateAgentId();
  const insertSql = `
    INSERT INTO delivery_agents (
      id, full_name, phone, email, service_area, status, vehicle_type, rating, completed_deliveries, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;

  const values = [
    id,
    input.full_name,
    input.phone,
    input.email,
    input.service_area,
    input.status || 'active',
    input.vehicle_type || 'bike',
    input.rating !== undefined ? input.rating : 5.0,
    input.completed_deliveries !== undefined ? input.completed_deliveries : 0,
  ];

  const result = await db.query(insertSql, values);
  const newAgent = result.rows[0];

  // Cache Invalidation
  await invalidateRelatedCaches(newAgent.id);

  // Warm individual cache
  await cache.set(`agents:detail:${newAgent.id}`, JSON.stringify(newAgent), config.redis.ttlDetail);

  return newAgent;
}

/**
 * Updates an existing delivery agent.
 * Invalidates Redis caches for detail, list, and stats.
 */
async function updateAgent(id, input) {
  const db = await getDb();

  // Check if agent exists
  const existing = await db.query('SELECT * FROM delivery_agents WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return null;
  }

  // Check email conflict if email changed
  if (input.email && input.email !== existing.rows[0].email) {
    const conflict = await db.query('SELECT id FROM delivery_agents WHERE email = $1 AND id != $2', [
      input.email,
      id,
    ]);
    if (conflict.rows.length > 0) {
      const err = new Error(`Email "${input.email}" is already used by another delivery agent.`);
      err.statusCode = 409;
      throw err;
    }
  }

  const current = existing.rows[0];
  const updated = {
    full_name: input.full_name !== undefined ? input.full_name : current.full_name,
    phone: input.phone !== undefined ? input.phone : current.phone,
    email: input.email !== undefined ? input.email : current.email,
    service_area: input.service_area !== undefined ? input.service_area : current.service_area,
    status: input.status !== undefined ? input.status : current.status,
    vehicle_type: input.vehicle_type !== undefined ? input.vehicle_type : current.vehicle_type,
    rating: input.rating !== undefined ? input.rating : current.rating,
    completed_deliveries:
      input.completed_deliveries !== undefined ? input.completed_deliveries : current.completed_deliveries,
  };

  const updateSql = `
    UPDATE delivery_agents
    SET full_name = $1,
        phone = $2,
        email = $3,
        service_area = $4,
        status = $5,
        vehicle_type = $6,
        rating = $7,
        completed_deliveries = $8,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `;

  const result = await db.query(updateSql, [
    updated.full_name,
    updated.phone,
    updated.email,
    updated.service_area,
    updated.status,
    updated.vehicle_type,
    updated.rating,
    updated.completed_deliveries,
    id,
  ]);

  const updatedAgent = result.rows[0];

  // Invalidate caches
  await invalidateRelatedCaches(id);

  // Warm cache with updated entity
  const cache = getCache();
  await cache.set(`agents:detail:${id}`, JSON.stringify(updatedAgent), config.redis.ttlDetail);

  return updatedAgent;
}

/**
 * Deletes a delivery agent by ID.
 * Evicts item from Redis and invalidates list/stats caches.
 */
async function deleteAgent(id) {
  const db = await getDb();
  const result = await db.query('DELETE FROM delivery_agents WHERE id = $1', [id]);

  if ((result.rowCount || 0) === 0) {
    return false;
  }

  // Invalidate caches
  await invalidateRelatedCaches(id);
  return true;
}

/**
 * Retrieves aggregated statistics with Redis caching.
 */
async function getStats() {
  const cache = getCache();
  const cacheKey = 'agents:stats';

  const cached = await cache.get(cacheKey);
  if (cached) {
    try {
      return { stats: JSON.parse(cached), fromCache: true };
    } catch {
      // Fall through
    }
  }

  const db = await getDb();
  const totalResult = await db.query('SELECT COUNT(*)::int as total FROM delivery_agents');
  const statusResult = await db.query(
    'SELECT status, COUNT(*)::int as count FROM delivery_agents GROUP BY status'
  );
  const areaResult = await db.query(
    'SELECT service_area, COUNT(*)::int as count FROM delivery_agents GROUP BY service_area ORDER BY count DESC LIMIT 8'
  );
  const vehicleResult = await db.query(
    'SELECT vehicle_type, COUNT(*)::int as count FROM delivery_agents GROUP BY vehicle_type'
  );
  const metricsResult = await db.query(`
    SELECT 
      COALESCE(ROUND(AVG(rating), 2), 5.0) as avg_rating,
      COALESCE(SUM(completed_deliveries), 0)::int as total_deliveries
    FROM delivery_agents
  `);

  const statusCounts = {
    active: 0,
    inactive: 0,
    on_delivery: 0,
    suspended: 0,
  };

  statusResult.rows.forEach((r) => {
    statusCounts[r.status] = parseInt(r.count, 10);
  });

  const stats = {
    totalAgents: parseInt(totalResult.rows[0]?.total || '0', 10),
    byStatus: statusCounts,
    topAreas: areaResult.rows.map((r) => ({ area: r.service_area, count: parseInt(r.count, 10) })),
    byVehicle: vehicleResult.rows.map((r) => ({ vehicle: r.vehicle_type, count: parseInt(r.count, 10) })),
    avgRating: parseFloat(metricsResult.rows[0]?.avg_rating || '5.0'),
    totalDeliveries: parseInt(metricsResult.rows[0]?.total_deliveries || '0', 10),
    calculatedAt: new Date().toISOString(),
  };

  await cache.set(cacheKey, JSON.stringify(stats), config.redis.ttlStats);

  return { stats, fromCache: false };
}

/**
 * Helper to invalidate all related Redis caches on mutation.
 */
async function invalidateRelatedCaches(agentId) {
  const cache = getCache();

  // 1. Invalidate single agent detail cache
  if (agentId) {
    await cache.del(`agents:detail:${agentId}`);
  }

  // 2. Invalidate all paginated/filtered list caches
  await cache.delByPattern('agents:list:*');

  // 3. Invalidate aggregated stats cache
  await cache.del('agents:stats');
}

/**
 * Manual cache flush for telemetry or testing.
 */
async function flushAllCaches() {
  const cache = getCache();
  await cache.flush();
  return { cleared: true };
}

// Export as named object to maintain backward-compatibility with existing imports
// (routes, tests use `AgentService.getAgents(...)` etc.)
const AgentService = {
  generateAgentId,
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getStats,
  invalidateRelatedCaches,
  flushAllCaches,
};

module.exports = {
  AgentService,
  // Also export individual functions for direct import if needed
  generateAgentId,
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  getStats,
  invalidateRelatedCaches,
  flushAllCaches,
};
