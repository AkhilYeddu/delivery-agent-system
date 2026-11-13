const { getDb, closeDb } = require('../config/db');
const { AgentService } = require('../services/agent.service');

const SAMPLE_AGENTS = [
  {
    full_name: 'Elena Rostova',
    phone: '+1-555-0143',
    email: 'elena.rostova@swiftcargo.io',
    service_area: 'Downtown Core',
    status: 'active',
    vehicle_type: 'electric_bike',
    rating: 4.9,
    completed_deliveries: 342,
  },
  {
    full_name: 'Marcus Vance',
    phone: '+1-555-0188',
    email: 'm.vance@swiftcargo.io',
    service_area: 'Harbor District',
    status: 'on_delivery',
    vehicle_type: 'scooter',
    rating: 4.8,
    completed_deliveries: 512,
  },
  {
    full_name: 'Amina Al-Mansoor',
    phone: '+1-555-0192',
    email: 'amina.m@swiftcargo.io',
    service_area: 'Tech Corridor',
    status: 'active',
    vehicle_type: 'bike',
    rating: 5.0,
    completed_deliveries: 189,
  },
  {
    full_name: 'Liam O\'Connor',
    phone: '+1-555-0125',
    email: 'liam.oc@swiftcargo.io',
    service_area: 'Metro West',
    status: 'inactive',
    vehicle_type: 'van',
    rating: 4.6,
    completed_deliveries: 620,
  },
  {
    full_name: 'Siddharth Patel',
    phone: '+1-555-0177',
    email: 'sid.patel@swiftcargo.io',
    service_area: 'Downtown Core',
    status: 'on_delivery',
    vehicle_type: 'electric_bike',
    rating: 4.9,
    completed_deliveries: 278,
  },
  {
    full_name: 'Chloe Tremblay',
    phone: '+1-555-0164',
    email: 'chloe.t@swiftcargo.io',
    service_area: 'Uptown Arts',
    status: 'active',
    vehicle_type: 'scooter',
    rating: 4.7,
    completed_deliveries: 410,
  },
  {
    full_name: 'Tariq Johnson',
    phone: '+1-555-0131',
    email: 'tariq.j@swiftcargo.io',
    service_area: 'North Suburbs',
    status: 'active',
    vehicle_type: 'car',
    rating: 4.9,
    completed_deliveries: 830,
  },
  {
    full_name: 'Sofia Reyes',
    phone: '+1-555-0159',
    email: 'sofia.reyes@swiftcargo.io',
    service_area: 'Harbor District',
    status: 'on_delivery',
    vehicle_type: 'bike',
    rating: 4.8,
    completed_deliveries: 154,
  },
  {
    full_name: 'Kenji Takahashi',
    phone: '+1-555-0118',
    email: 'kenji.t@swiftcargo.io',
    service_area: 'Tech Corridor',
    status: 'inactive',
    vehicle_type: 'electric_bike',
    rating: 4.5,
    completed_deliveries: 95,
  },
  {
    full_name: 'Zoe Becker',
    phone: '+1-555-0104',
    email: 'zoe.becker@swiftcargo.io',
    service_area: 'Uptown Arts',
    status: 'suspended',
    vehicle_type: 'walker',
    rating: 3.8,
    completed_deliveries: 42,
  },
];

async function seedSampleAgents() {
  const db = await getDb();
  let inserted = 0;

  for (const agent of SAMPLE_AGENTS) {
    const existing = await db.query('SELECT id FROM delivery_agents WHERE email = $1', [agent.email]);
    if (existing.rows.length === 0) {
      await AgentService.createAgent(agent);
      inserted++;
    }
  }

  // Flush cache to ensure consistent fresh state
  await AgentService.flushAllCaches();
  return inserted;
}

if (require.main === module) {
  (async () => {
    try {
      console.log('[Seed] Seeding sample delivery agents into PostgreSQL...');
      const count = await seedSampleAgents();
      console.log(`[Seed] Seeded ${count} new delivery agents.`);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
    } finally {
      await closeDb();
      process.exit(0);
    }
  })();
}

module.exports = {
  SAMPLE_AGENTS,
  seedSampleAgents,
};
