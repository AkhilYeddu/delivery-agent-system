-- Delivery Agent Management System
-- Database Schema for PostgreSQL

CREATE TABLE IF NOT EXISTS delivery_agents (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    service_area VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_delivery', 'suspended')),
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'bike' CHECK (vehicle_type IN ('bike', 'scooter', 'car', 'van', 'electric_bike', 'walker')),
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    completed_deliveries INTEGER NOT NULL DEFAULT 0 CHECK (completed_deliveries >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_agents_status ON delivery_agents(status);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_service_area ON delivery_agents(service_area);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_email ON delivery_agents(email);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_created_at ON delivery_agents(created_at DESC);
