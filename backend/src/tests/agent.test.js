const request = require('supertest');
const { createApp } = require('../app');
const { closeDb } = require('../config/db');

const app = createApp();

describe('Delivery Agent API - CRUD Flow', () => {
  let createdAgentId;
  const testEmail = `test.agent.${Date.now()}@example.com`;

  afterAll(async () => {
    await closeDb();
  });

  test('POST /api/agents - should successfully create a new delivery agent', async () => {
    const payload = {
      full_name: 'Arthur Pendelton',
      phone: '+1-555-8833',
      email: testEmail,
      service_area: 'Downtown Core',
      status: 'active',
      vehicle_type: 'electric_bike',
      rating: 4.9,
      completed_deliveries: 12,
    };

    const res = await request(app).post('/api/agents').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toMatch(/^AGT-/);
    expect(res.body.data.full_name).toBe(payload.full_name);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.created_at).toBeDefined();
    expect(res.body.data.updated_at).toBeDefined();

    createdAgentId = res.body.data.id;
  });

  test('POST /api/agents - should reject duplicate email with 409 Conflict', async () => {
    const duplicatePayload = {
      full_name: 'Imposter Agent',
      phone: '+1-555-9999',
      email: testEmail, // same email
      service_area: 'Metro West',
      status: 'active',
    };

    const res = await request(app).post('/api/agents').send(duplicatePayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  test('POST /api/agents - should reject invalid data with 400 Bad Request', async () => {
    const invalidPayload = {
      full_name: 'A', // too short
      email: 'not-an-email',
      phone: '123',
      service_area: '',
    };

    const res = await request(app).post('/api/agents').send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });

  test('GET /api/agents - should return paginated list of agents', async () => {
    const res = await request(app).get('/api/agents?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  test('GET /api/agents/:id - should retrieve individual agent details', async () => {
    const res = await request(app).get(`/api/agents/${createdAgentId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdAgentId);
    expect(res.body.data.email).toBe(testEmail);
  });

  test('GET /api/agents/:id - should return 404 for nonexistent agent', async () => {
    const res = await request(app).get('/api/agents/AGT-NONEXISTENT-999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/agents/:id - should update agent information', async () => {
    const updatePayload = {
      status: 'on_delivery',
      service_area: 'Harbor District',
      rating: 5.0,
      completed_deliveries: 15,
    };

    const res = await request(app).put(`/api/agents/${createdAgentId}`).send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('on_delivery');
    expect(res.body.data.service_area).toBe('Harbor District');
    expect(Number(res.body.data.rating)).toBe(5.0);
    expect(res.body.data.completed_deliveries).toBe(15);
  });

  test('DELETE /api/agents/:id - should remove the agent record', async () => {
    const res = await request(app).delete(`/api/agents/${createdAgentId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const verifyRes = await request(app).get(`/api/agents/${createdAgentId}`);
    expect(verifyRes.status).toBe(404);
  });
});

