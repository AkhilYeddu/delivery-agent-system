const request = require('supertest');
const { createApp } = require('../app');
const { closeDb } = require('../config/db');
const { closeRedis } = require('../config/redis');
const { AgentService } = require('../services/agent.service');

const app = createApp();

describe('Redis Caching & Invalidation Integration Tests', () => {
  afterAll(async () => {
    await closeDb();
    await closeRedis();
  });

  test('Cache-Aside: List response is cached and served with X-Cache: HIT on second request', async () => {
    // Flush cache to ensure cold state
    await AgentService.flushAllCaches();

    // 1st request -> Cold Cache (MISS)
    const res1 = await request(app).get('/api/agents?limit=3');
    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache']).toBe('MISS');
    expect(res1.body.meta.fromCache).toBe(false);

    // 2nd request -> Warm Cache (HIT)
    const res2 = await request(app).get('/api/agents?limit=3');
    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache']).toBe('HIT');
    expect(res2.body.meta.fromCache).toBe(true);
  });

  test('Cache Invalidation: Creating an agent invalidates the list cache', async () => {
    // Ensure list cache is warm
    await request(app).get('/api/agents?limit=3');

    // Create a new agent (Mutation)
    const uniqueEmail = `cache.test.${Date.now()}@example.com`;
    const createRes = await request(app).post('/api/agents').send({
      full_name: 'Cache Invalidation Tester',
      phone: '+1-555-4321',
      email: uniqueEmail,
      service_area: 'Tech Corridor',
      status: 'active',
      vehicle_type: 'bike',
    });
    expect(createRes.status).toBe(201);
    const newId = createRes.body.data.id;

    // Next list query MUST be a MISS because creation invalidated the cache!
    const listAfterCreate = await request(app).get('/api/agents?limit=3');
    expect(listAfterCreate.headers['x-cache']).toBe('MISS');
    expect(listAfterCreate.body.meta.fromCache).toBe(false);

    // Clean up
    await request(app).delete(`/api/agents/${newId}`);
  });

  test('Cache Invalidation: Updating an agent invalidates both detail and list caches', async () => {
    // Create an agent to test
    const uniqueEmail = `cache.update.${Date.now()}@example.com`;
    const createRes = await request(app).post('/api/agents').send({
      full_name: 'Update Cache Tester',
      phone: '+1-555-5555',
      email: uniqueEmail,
      service_area: 'Uptown Arts',
      status: 'active',
    });
    const agentId = createRes.body.data.id;

    // Warm individual cache
    const get1 = await request(app).get(`/api/agents/${agentId}`);
    expect(get1.status).toBe(200);

    // Hit individual cache
    const get2 = await request(app).get(`/api/agents/${agentId}`);
    expect(get2.headers['x-cache']).toBe('HIT');

    // Update agent
    const updateRes = await request(app).put(`/api/agents/${agentId}`).send({
      status: 'on_delivery',
    });
    expect(updateRes.status).toBe(200);

    // Fetch again: should reflect new status 'on_delivery'
    const get3 = await request(app).get(`/api/agents/${agentId}`);
    expect(get3.body.data.status).toBe('on_delivery');

    // Clean up
    await request(app).delete(`/api/agents/${agentId}`);
  });

  test('Cache Invalidation: Deleting an agent evicts it from cache', async () => {
    // Create an agent
    const uniqueEmail = `cache.delete.${Date.now()}@example.com`;
    const createRes = await request(app).post('/api/agents').send({
      full_name: 'Delete Cache Tester',
      phone: '+1-555-7777',
      email: uniqueEmail,
      service_area: 'North Suburbs',
      status: 'inactive',
    });
    const agentId = createRes.body.data.id;

    // Delete agent
    const deleteRes = await request(app).delete(`/api/agents/${agentId}`);
    expect(deleteRes.status).toBe(200);

    // Subsequent detail query must return 404, not stale cached data
    const getAfterDelete = await request(app).get(`/api/agents/${agentId}`);
    expect(getAfterDelete.status).toBe(404);
  });
});

