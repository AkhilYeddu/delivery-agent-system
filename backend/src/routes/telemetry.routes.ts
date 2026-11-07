import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';

const router = Router();

router.get('/health', AgentController.getHealth);
router.get('/cache/stats', AgentController.getCacheTelemetry);
router.post('/cache/flush', AgentController.flushCache);

export default router;
