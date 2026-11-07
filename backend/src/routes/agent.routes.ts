import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentQuerySchema,
} from '../models/agent.model';
import { seedSampleAgents } from '../db/seed';

const router = Router();

// Stats route (placed before :id to prevent param collision)
router.get('/stats', AgentController.getStats);

// Seed route for demo/evaluation
router.post('/seed', async (_req, res, next) => {
  try {
    const count = await seedSampleAgents();
    res.status(200).json({
      success: true,
      message: `Successfully seeded ${count} sample delivery agents.`,
    });
  } catch (err) {
    next(err);
  }
});

// Standard CRUD endpoints
router.get('/', validateRequest({ query: AgentQuerySchema }), AgentController.getAgents);
router.get('/:id', AgentController.getAgentById);
router.post('/', validateRequest({ body: CreateAgentSchema }), AgentController.createAgent);
router.put('/:id', validateRequest({ body: UpdateAgentSchema }), AgentController.updateAgent);
router.patch('/:id', validateRequest({ body: UpdateAgentSchema }), AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);

export default router;
