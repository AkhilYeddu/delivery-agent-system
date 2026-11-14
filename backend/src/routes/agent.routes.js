const { Router } = require('express');
const { AgentController } = require('../controllers/agent.controller');
const {
  validateCreate,
  validateUpdate,
  validateQuery,
} = require('../middlewares/validate.middleware');

const router = Router();

// Stats route (placed before :id to prevent param collision)
router.get('/stats', AgentController.getStats);

// Standard CRUD endpoints with direct Express middlewares
router.get('/', validateQuery, AgentController.getAgents);
router.get('/:id', AgentController.getAgentById);
router.post('/', validateCreate, AgentController.createAgent);
router.put('/:id', validateUpdate, AgentController.updateAgent);
router.patch('/:id', validateUpdate, AgentController.updateAgent);
router.delete('/:id', AgentController.deleteAgent);

module.exports = router;
