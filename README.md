# FuelRescue — Emergency Fuel Assistance for Stranded Vehicles

> **15-second product explanation:**
> “Stranded without fuel? Request emergency assistance, find suitable nearby fuel support, and track delivery—even offline. Your request syncs automatically when connectivity returns.”

---

## 1. System Overview & Problem Foundation
FuelRescue is a full-stack, offline-first emergency fuel dispatch system designed for national highways in India (with initial study context focused on the **Telangana / Hyderabad NH 44, NH 65, and Outer Ring Road corridors**).

The system architecture directly operationalizes the findings from the attached **Problem Solving in Engineering (PSE) Modules 1, 2, and 3**:
- **Baseline Infrastructure (MoRTH & PPAC Data)**: 146,145 km National Highway network; 4,189 petroleum retail outlets, 205 CNG stations, and 996 EV charging points in Telangana.
- **The Core Leverage Point (Module 3, ★)**: Accurate emergency request information combined with automated source/provider matching. By improving information accuracy and automated dispatch, the system cuts through the vicious delay cycle (Reinforcing Loop R1) into the balancing stabilization loop (B1).
- **Offline-First Resilience**: Enables stranded drivers in zero-connectivity cuts to generate uniquely identifiable, validated emergency requests stored in **IndexedDB (Dexie.js)** with status `PENDING_SYNC`. When network connectivity resumes, requests automatically synchronize via an idempotent REST API into **Aiven PostgreSQL**.

---

## 2. Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4 | Responsive, mobile-first emergency driver interface |
| **PWA & Offline** | Service Worker (`sw.js`), Dexie.js (IndexedDB) | App shell caching, offline request queue, background sync |
| **Location & Maps**| Highway Corridor Radar, GPS Geolocation, Presets | Real-time distance calculation, nearest provider/outlet locator |
| **Vehicle ID** | Cryptographic Opaque QR Code Generator & Scanner | Windshield pass verification without leaking personal PII |
| **Dev Full-Stack** | Node.js + Express 4 (`server.ts`) on Port 3000 | Live REST API under `/api/v1` with Vite middleware |
| **Backend Service**| Java 17 + Spring Boot 3.3.4 (in `/backend`) | Enterprise REST API, Spring Security, Data JPA, Bean Validation |
| **Database** | Aiven Console-Managed PostgreSQL 16 | Relational persistence, Flyway migrations (`V1__init_schema.sql`) |

---

## 3. Four Core Stakeholder Personas

1. **Driver / Passenger**:
   - Prominent, instant "Request Emergency Fuel" action.
   - MoRTH Highway Safety Advisory.
   - GPS detection or one-tap highway landmark presets (Medchal, Choutuppal, Shamshabad ORR).
   - Real-time price estimator based on official Telangana tariff (Petrol ₹109.66/L, Diesel ₹97.82/L).
   - Lifecycle tracking: `PENDING_SYNC -> SYNCED -> MATCHING -> PROVIDER_ACCEPTED -> DISPATCHED -> ARRIVING -> DELIVERED -> COMPLETED`.
   - Windshield QR Pass generation and simulated sandbox checkout (UPI, Cards, Cash).

2. **Assistance Provider (Highway Patrol Unit)**:
   - Duty availability toggle (`AVAILABLE`, `BUSY`, `OFF_DUTY`).
   - Incoming request pool with concurrency locking (prevents duplicate claims).
   - Job advancement stepper (Accept -> Dispatched -> Arriving -> Delivered -> Completed).
   - Direct driver phone dialer, vehicle details, and earnings summaries.

3. **Fuel Outlet / Station Operator**:
   - Manage stock availability for Petrol, Diesel, and PESO-certified safety canisters.
   - Update regulated retail price per litre.
   - Review requests sourcing fuel from the station.

4. **System Administrator**:
   - High-level metrics: Active requests, response time (avg 16.4 min), total fuel delivered.
   - Provider verification and status controls.
   - Live audit logs and synchronization trail.
   - One-click CSV report export.

---

## 4. Offline Testing & Verification Procedure
You can verify the complete offline-first flow directly in your browser:
1. Open the application.
2. In the top status bar, click **"Simulate Disconnected Network"** (or turn off Wi-Fi).
3. Notice the amber alert banner: *"Offline Mode Engaged — Requests saved locally in IndexedDB"*.
4. Click **"Request Emergency Fuel"** and submit a request for 5L Petrol on NH 44.
5. Notice the request is saved immediately with client UUID and marked **"Pending Cloud Sync"**.
6. Refresh the page or close the tab: the record persists safely in IndexedDB.
7. Click **"Exit Offline Simulation"** (or restore Wi-Fi):
   - The sync engine fires automatically.
   - Request is transmitted to `/api/v1/requests/sync`.
   - Backend assigns server ID `FR-2026-XXXX` and returns confirmed status.
   - Local record updates to **"SYNCED"**.

---

## 5. Local Setup Instructions

### Frontend & Live Dev Server
```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev
```

### Spring Boot Backend (Optional standalone)
```bash
cd backend
./mvnw spring-boot:run
```

---

## 6. Aiven PostgreSQL Database Setup
1. In [Aiven Console](https://console.aiven.io/), provision a PostgreSQL service.
2. Copy your connection parameters from the service overview:
   - Host, Port, User (`avnadmin`), Password, Database (`defaultdb`).
3. Add to your backend environment:
   ```bash
   export DB_URL="jdbc:postgresql://<HOST>:<PORT>/defaultdb?sslmode=require"
   export DB_USER="avnadmin"
   export DB_PASSWORD="<AIVEN_PASSWORD>"
   ```
4. Spring Boot will automatically run Flyway migrations from `backend/src/main/resources/db/migration/V1__init_schema.sql`.
