-- ==============================================================================
-- FuelRescue PostgreSQL Database Migration V1
-- Target Database: Aiven Console-Managed PostgreSQL
-- Conforms to PSE Modules 1-3 Problem Architecture
-- ==============================================================================

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('DRIVER', 'PROVIDER', 'OUTLET', 'ADMIN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(30) UNIQUE NOT NULL,
    make_model VARCHAR(100) NOT NULL,
    fuel_type VARCHAR(15) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    tank_capacity_liters NUMERIC(5, 2) NOT NULL,
    qr_code_token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_vehicles_qr_token ON vehicles(qr_code_token);

-- 3. Fuel Outlets Table (PPAC Baseline Support)
CREATE TABLE fuel_outlets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    omc VARCHAR(30) NOT NULL, -- IOCL, BPCL, HPCL, SHELL, JIO_BP
    highway VARCHAR(120) NOT NULL, -- e.g. NH 44, NH 65, ORR
    landmark VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    petrol_available BOOLEAN DEFAULT TRUE,
    diesel_available BOOLEAN DEFAULT TRUE,
    petrol_price NUMERIC(7, 2) NOT NULL DEFAULT 109.66,
    diesel_price NUMERIC(7, 2) NOT NULL DEFAULT 97.82,
    operating_hours VARCHAR(60) DEFAULT '24 Hours',
    has_emergency_cans BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fuel_outlets_highway ON fuel_outlets(highway);
CREATE INDEX idx_fuel_outlets_coords ON fuel_outlets(latitude, longitude);

-- 4. Assistance Providers Table
CREATE TABLE provider_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name VARCHAR(150) NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    coverage_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 25.00,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'OFF_DUTY')),
    is_verified BOOLEAN DEFAULT FALSE,
    supported_fuel VARCHAR(50) NOT NULL, -- comma separated or json array
    rating NUMERIC(3, 2) DEFAULT 5.00,
    completed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_status ON provider_profiles(status);
CREATE INDEX idx_providers_verified ON provider_profiles(is_verified);

-- 5. Assistance Requests Table (Core Leverage Point)
CREATE TABLE assistance_requests (
    id VARCHAR(64) PRIMARY KEY, -- e.g. FR-2026-8920
    client_request_id VARCHAR(128) UNIQUE NOT NULL, -- UUID generated offline on client
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    vehicle_id VARCHAR(64) REFERENCES vehicles(id),
    vehicle_number VARCHAR(30) NOT NULL,
    fuel_type VARCHAR(15) NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    requested_quantity NUMERIC(5, 2) NOT NULL CHECK (requested_quantity >= 1 AND requested_quantity <= 25),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    location_description VARCHAR(500) NOT NULL,
    situation_notes TEXT,
    request_status VARCHAR(30) NOT NULL CHECK (request_status IN (
        'PENDING_SYNC', 'SYNCED', 'MATCHING', 'PROVIDER_ACCEPTED',
        'DISPATCHED', 'ARRIVING', 'DELIVERED', 'COMPLETED',
        'CANCELLED', 'REJECTED', 'SYNC_FAILED'
    )),
    sync_status VARCHAR(20) NOT NULL DEFAULT 'SYNCED' CHECK (sync_status IN ('SAVED_OFFLINE', 'PENDING_SYNC', 'SYNCING', 'SYNCED', 'SYNC_FAILED')),
    estimated_cost NUMERIC(10, 2) NOT NULL,
    confirmed_cost NUMERIC(10, 2),
    assigned_provider_id VARCHAR(64) REFERENCES provider_profiles(id),
    outlet_source_id VARCHAR(64) REFERENCES fuel_outlets(id),
    eta_minutes INTEGER,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'CONFIRMED', 'SIMULATED_SUCCESS', 'CASH_ON_DELIVERY')),
    payment_method VARCHAR(30),
    transaction_reference VARCHAR(100),
    sync_retry_count INTEGER DEFAULT 0,
    last_sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synchronized_at TIMESTAMP WITH TIME ZONE,
    version BIGINT DEFAULT 1
);

CREATE INDEX idx_requests_client_id ON assistance_requests(client_request_id);
CREATE INDEX idx_requests_user_id ON assistance_requests(user_id);
CREATE INDEX idx_requests_status ON assistance_requests(request_status);
CREATE INDEX idx_requests_created_at ON assistance_requests(created_at DESC);

-- 6. Request Status History Table (Audit Trail)
CREATE TABLE request_status_history (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES assistance_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    notes TEXT,
    actor_id VARCHAR(64),
    actor_role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_request ON request_status_history(request_id);

-- 7. Transactions & Payment Records Table
CREATE TABLE transactions (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES assistance_requests(id),
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    fuel_charge NUMERIC(10, 2) NOT NULL,
    service_delivery_fee NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    is_simulated_sandbox BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Synchronization Audit Logs Table
CREATE TABLE synchronization_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    client_request_id VARCHAR(128) NOT NULL,
    server_request_id VARCHAR(64),
    event_type VARCHAR(40) NOT NULL,
    details TEXT,
    is_success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_audit_client_id ON synchronization_audit_logs(client_request_id);

-- 9. Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    request_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
