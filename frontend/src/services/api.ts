import axios from 'axios';
import {
  AgentListResponse,
  AgentDetailResponse,
  CreateAgentPayload,
  UpdateAgentPayload,
  DashboardStats,
  CacheTelemetry,
} from '../types/agent';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface QueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  service_area?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const agentApi = {
  async getAgents(filters: QueryFilters = {}): Promise<AgentListResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.service_area && filters.service_area !== 'all') params.append('service_area', filters.service_area);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get<AgentListResponse>(`/agents?${params.toString()}`);
    return response.data;
  },

  async getAgentById(id: string): Promise<AgentDetailResponse> {
    const response = await api.get<AgentDetailResponse>(`/agents/${id}`);
    return response.data;
  },

  async createAgent(payload: CreateAgentPayload) {
    const response = await api.post('/agents', payload);
    return response.data;
  },

  async updateAgent(id: string, payload: UpdateAgentPayload) {
    const response = await api.put(`/agents/${id}`, payload);
    return response.data;
  },

  async deleteAgent(id: string) {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  async getStats(): Promise<{ data: DashboardStats; meta: { fromCache: boolean; durationMs: number } }> {
    const response = await api.get('/agents/stats');
    return response.data;
  },

  async getCacheTelemetry(): Promise<CacheTelemetry> {
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
