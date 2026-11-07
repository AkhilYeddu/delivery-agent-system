export type AgentStatus = 'active' | 'inactive' | 'on_delivery' | 'suspended';

export type VehicleType = 'bike' | 'scooter' | 'car' | 'van' | 'electric_bike' | 'walker';

export interface DeliveryAgent {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  service_area: string;
  status: AgentStatus;
  vehicle_type: VehicleType;
  rating: number;
  completed_deliveries: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentPayload {
  full_name: string;
  phone: string;
  email: string;
  service_area: string;
  status: AgentStatus;
  vehicle_type: VehicleType;
  rating?: number;
  completed_deliveries?: number;
}

export interface UpdateAgentPayload extends Partial<CreateAgentPayload> {}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgentListResponse {
  success: boolean;
  data: DeliveryAgent[];
  pagination: PaginationMeta;
  meta: {
    fromCache: boolean;
    durationMs: number;
  };
}

export interface AgentDetailResponse {
  success: boolean;
  data: DeliveryAgent;
  meta: {
    fromCache: boolean;
    durationMs: number;
  };
}

export interface DashboardStats {
  totalAgents: number;
  byStatus: {
    active: number;
    inactive: number;
    on_delivery: number;
    suspended: number;
  };
  topAreas: Array<{ area: string; count: number }>;
  byVehicle: Array<{ vehicle: string; count: number }>;
  avgRating: number;
  totalDeliveries: number;
  calculatedAt: string;
}

export interface CacheTelemetry {
  status: 'connected' | 'fallback' | 'disconnected';
  type: string;
  hits: number;
  misses: number;
  hitRate: string;
  keysCount: number;
  latencyMs: number;
}

