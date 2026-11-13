const { Router } = require('express');
const { AgentController } = require('../controllers/agent.controller');

const router = Router();

router.get('/health', AgentController.getHealth);
router.get('/cache/stats', AgentController.getCacheTelemetry);
router.post('/cache/flush', AgentController.flushCache);

module.exports = router;
