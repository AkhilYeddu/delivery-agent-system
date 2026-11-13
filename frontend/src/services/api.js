import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
let computedBaseUrl = '/api';

if (rawApiUrl) {
  const cleaned = rawApiUrl.replace(/\/+$/, '');
  computedBaseUrl = cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

const api = axios.create({
  baseURL: computedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentApi = {
  async getAgents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.service_area && filters.service_area !== 'all') params.append('service_area', filters.service_area);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/agents?${params.toString()}`);
    return response.data;
  },

  async getAgentById(id) {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  async createAgent(payload) {
    const response = await api.post('/agents', payload);
    return response.data;
  },

  async updateAgent(id, payload) {
    const response = await api.put(`/agents/${id}`, payload);
    return response.data;
  },

  async deleteAgent(id) {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/agents/stats');
    return response.data;
  },

  async getCacheTelemetry() {
    const response = await api.get('/cache/stats');
    return response.data.data;
  },

  async flushCache() {
    const response = await api.post('/cache/flush');
    return response.data;
  },

  async seedDemoAgents() {
    const response = await api.post('/agents/seed');
    return response.data;
  },
};

