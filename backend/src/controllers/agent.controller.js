const { AgentService } = require('../services/agent.service');
const { getCache } = require('../config/redis');
const { getDb } = require('../config/db');

class AgentController {
  static async getAgents(req, res, next) {
    const startTime = Date.now();
    try {
      const result = await AgentService.getAgents(req.query);
      const durationMs = Date.now() - startTime;

      res.setHeader('X-Cache', result.fromCache ? 'HIT' : 'MISS');
      res.setHeader('X-Response-Time-Ms', durationMs.toString());

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          fromCache: result.fromCache,
          durationMs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAgentById(req, res, next) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const { agent, fromCache } = await AgentService.getAgentById(id);
      const durationMs = Date.now() - startTime;

      if (!agent) {
        res.status(404).json({
          success: false,
          message: `Delivery agent with ID "${id}" was not found.`,
        });
        return;
      }

      res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
      res.setHeader('X-Response-Time-Ms', durationMs.toString());

      res.status(200).json({
        success: true,
        data: agent,
        meta: {
          fromCache,
          durationMs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAgent(req, res, next) {
    try {
      const agent = await AgentService.createAgent(req.body);
      res.status(201).json({
        success: true,
        message: 'Delivery agent created successfully.',
        data: agent,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAgent(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await AgentService.updateAgent(id, req.body);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Cannot update. Delivery agent with ID "${id}" was not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Delivery agent updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAgent(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await AgentService.deleteAgent(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Cannot delete. Delivery agent with ID "${id}" was not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Delivery agent with ID "${id}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    const startTime = Date.now();
    try {
      const { stats, fromCache } = await AgentService.getStats();
      const durationMs = Date.now() - startTime;

      res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
      res.setHeader('X-Response-Time-Ms', durationMs.toString());

      res.status(200).json({
        success: true,
        data: stats,
        meta: {
          fromCache,
          durationMs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCacheTelemetry(req, res, next) {
    try {
      const cache = getCache();
      const stats = await cache.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async flushCache(req, res, next) {
    try {
      await AgentService.flushAllCaches();
      res.status(200).json({
        success: true,
        message: 'All Redis cache entries flushed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHealth(req, res, next) {
    try {
      const db = await getDb();
      const dbHealth = await db.checkHealth();
      const cache = getCache();
      const cacheStats = await cache.getStats();

      res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        cache: cacheStats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  AgentController,
};

