# Aiven PostgreSQL Database Schema & Flyway Migrations

## 1. Database Hosting Specification
- **Engine**: PostgreSQL 16 (Relational)
- **Host**: Aiven Console (`pg-<project-name>.aivencloud.com`)
- **SSL Requirement**: `sslmode=require` (Mandatory for Aiven cloud security)
- **Migration Tool**: Flyway (`V1__init_schema.sql`)

## 2. Entity-Relationship Schema Details

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Unique user ID |
| `name` | VARCHAR(120) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `phone` | VARCHAR(20) | NOT NULL | Contact telephone |
| `role` | VARCHAR(30) | NOT NULL | DRIVER, PROVIDER, OUTLET, ADMIN |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account state |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Registration date |

### `vehicles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Vehicle ID |
| `user_id` | VARCHAR(64) | FK -> users(id) | Vehicle owner |
| `vehicle_number` | VARCHAR(30) | UNIQUE, NOT NULL | License plate |
| `make_model` | VARCHAR(100) | NOT NULL | Model description |
| `fuel_type` | VARCHAR(15) | PETROL / DIESEL | Engine fuel requirement |
| `tank_capacity_liters` | NUMERIC(5,2) | NOT NULL | Tank capacity |
| `qr_code_token` | VARCHAR(128) | UNIQUE, NOT NULL | Cryptographic opaque QR reference |

### `assistance_requests` (Core System Table)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Server assigned (e.g. FR-2026-8920) |
| `client_request_id` | VARCHAR(128) | UNIQUE, NOT NULL | UUID minted offline |
| `user_id` | VARCHAR(64) | FK -> users(id) | Driver identifier |
| `vehicle_number` | VARCHAR(30) | NOT NULL | Target vehicle plate |
| `fuel_type` | VARCHAR(15) | PETROL / DIESEL | Fuel requested |
| `requested_quantity` | NUMERIC(5,2) | 1.00 to 25.00 | Volume in litres |
| `latitude` | NUMERIC(10,7) | NOT NULL | GPS latitude |
| `longitude` | NUMERIC(10,7) | NOT NULL | GPS longitude |
| `location_description` | VARCHAR(500) | NOT NULL | Road/Shoulder description |
| `request_status` | VARCHAR(30) | Valid Enum | PENDING_SYNC -> COMPLETED |
| `sync_status` | VARCHAR(20) | Valid Enum | SAVED_OFFLINE, PENDING_SYNC, SYNCED |
| `estimated_cost` | NUMERIC(10,2) | NOT NULL | Fuel cost + Delivery fee |
| `confirmed_cost` | NUMERIC(10,2) | NULLABLE | Final verified amount |
| `assigned_provider_id` | VARCHAR(64) | FK -> provider_profiles | Assigned response unit |
| `outlet_source_id` | VARCHAR(64) | FK -> fuel_outlets | Retail dispensing station |
| `version` | BIGINT | DEFAULT 1 | Optimistic locking token |

### `transactions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(64) | PRIMARY KEY | Transaction reference |
| `request_id` | VARCHAR(64) | FK -> assistance_requests | Associated emergency request |
| `fuel_charge` | NUMERIC(10,2) | NOT NULL | Base fuel rate amount |
| `service_delivery_fee`| NUMERIC(10,2) | NOT NULL | Highway patrol service fee |
| `total_amount` | NUMERIC(10,2) | NOT NULL | Total paid |
| `payment_method` | VARCHAR(30) | NOT NULL | UPI / Card / Cash |
| `payment_status` | VARCHAR(30) | NOT NULL | PENDING / SIMULATED_SUCCESS / CONFIRMED |
| `is_simulated_sandbox`| BOOLEAN | DEFAULT FALSE | Explicit test environment indicator |
