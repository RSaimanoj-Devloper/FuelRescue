# REST API Documentation (/api/v1)

## Base URL
- Production: `https://api.fuelrescue.in/api/v1`
- Development: `http://localhost:3000/api/v1` or `http://localhost:8080/api/v1`

## Endpoints

### 1. Healthcheck
- **GET `/api/v1/health`**
  - Returns backend health, database connection state, and current timestamp.

### 2. Authentication
- **POST `/api/v1/auth/login`**
  - Body: `{ "email": "driver@fuelrescue.in", "role": "DRIVER" }`
  - Returns: `{ "user": { ... }, "token": "jwt_..." }`

### 3. Emergency Requests & Synchronization
- **POST `/api/v1/requests/sync`**
  - Headers: `X-Client-Request-Id: <UUID>`
  - Body:
    ```json
    {
      "clientRequestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "userId": "user-driver-demo",
      "vehicleNumber": "TS 09 EA 4821",
      "fuelType": "PETROL",
      "requestedQuantity": 5,
      "latitude": 17.6250,
      "longitude": 78.4790,
      "locationDescription": "NH 44 Northbound, outer shoulder near Medchal"
    }
    ```
  - **Idempotency Guarantee**: If a request with the same `clientRequestId` has already been synchronized, the server returns HTTP 200 with the existing record rather than creating a duplicate.

- **GET `/api/v1/requests`**
  - Query Params: `userId`, `providerId`, `status`
  - Returns array of assistance requests sorted newest first.

- **GET `/api/v1/requests/:id`**
  - Returns request details with assigned provider and outlet source.

- **PATCH `/api/v1/requests/:id/status`**
  - Body: `{ "status": "DISPATCHED", "note": "En route with canisters", "actorRole": "PROVIDER" }`
  - Valid transitions: `MATCHING -> PROVIDER_ACCEPTED -> DISPATCHED -> ARRIVING -> DELIVERED -> COMPLETED`.

- **POST `/api/v1/requests/:id/accept`**
  - Body: `{ "providerId": "PROV-TEL-01" }`
  - Atomically assigns request to provider with concurrency lock.

### 4. Vehicle QR Lookup
- **GET `/api/v1/vehicles/qr/:token`**
  - Verifies opaque cryptographic vehicle reference token without leaking passwords or sensitive PII.

### 5. Payments (Sandbox Simulation)
- **POST `/api/v1/transactions/simulate-payment`**
  - Body: `{ "requestId": "FR-2026-8919", "method": "UPI_GPAY_PHONEPE" }`
  - Returns confirmed simulated transaction receipt reference.

### 6. Admin Analytics
- **GET `/api/v1/admin/metrics`**
  - Real-time operational aggregates computed from database records.
- **GET `/api/v1/admin/logs`**
  - Historical synchronization and status event audit trail.
