const { Router } = require('express');
const { AgentController } = require('../controllers/agent.controller');
const { validateRequest } = require('../middlewares/validate.middleware');
const {
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentQuerySchema,
} = require('../models/agent.model');

const router = Router();

// Stats route (placed before :id to prevent param collision)
router.get('/stats', AgentController.getStats);

// Standard CRUD endpoints
router.get('/', validateRequest({ query: AgentQuerySchema }), AgentController.getAgents);
router.get('/:id', AgentController.getAgentById);
router.post('/', validateRequest({ body: CreateAgentSchema }), AgentController.createAgent);
router.put('/:id', validateRequest({ body: UpdateAgentSchema }), AgentController.updateAgent);
router.patch('/:id', validateRequest({ body: UpdateAgentSchema }), AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);

module.exports = router;
