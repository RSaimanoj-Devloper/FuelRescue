# FuelRescue — System Architecture Documentation

## 1. System Overview
FuelRescue is an emergency roadside fuel assistance system designed specifically for Indian National Highways (e.g. NH 44, NH 65, and Hyderabad Outer Ring Road). The system addresses the critical problem of vehicles stranded after fuel depletion where immediate fuel sources are inaccessible, late at night, or during long-distance transit.

## 2. High-Level Architecture
```
+-----------------------------------------------------------------------------------+
|                              CLIENT TIER (PWA & Offline)                          |
|  - React 19 + TypeScript + Vite + Tailwind CSS                                    |
|  - Service Worker (sw.js) for static asset caching                                |
|  - Dexie.js (IndexedDB) for local offline request queue                           |
|  - In-App PWA Install Prompt + GPS Geolocation + Highway Presets                   |
|  - QR Code Engine for Vehicle Identification                                      |
+-----------------------------------------------------------------------------------+
                                    |
                    [HTTPS / REST API / Background Sync]
                                    v
+-----------------------------------------------------------------------------------+
|                              BACKEND SERVICE TIER                                 |
|  - Java 17 + Spring Boot 3.3.x (Web, Security, Data JPA, Bean Validation)         |
|  - Node.js / Express development server proxy (/api/v1)                           |
|  - JWT Authentication & RBAC (DRIVER, PROVIDER, OUTLET, ADMIN)                    |
|  - Idempotent Request Synchronizer (client_request_id unique constraint)          |
|  - Haversine Distance-Based Provider Matching Engine                              |
|  - Concurrency Lock & Status State Machine                                        |
+-----------------------------------------------------------------------------------+
                                    |
                             [TLS / SSL Mode]
                                    v
+-----------------------------------------------------------------------------------+
|                             DATA PERSISTENCE TIER                                 |
|  - Aiven Console-Managed PostgreSQL 16                                            |
|  - Flyway Database Migrations (V1__init_schema.sql)                                |
|  - Normalized Relational Model:                                                   |
|      * users, vehicles, fuel_outlets, provider_profiles                           |
|      * assistance_requests, request_status_history, transactions                  |
|      * synchronization_audit_logs, notifications                                  |
+-----------------------------------------------------------------------------------+
```

## 3. Offline-First Synchronization Protocol
As specified in the problem definition diagram:
1. When stranded in zero-connectivity highway zones:
   - User opens the locally cached FuelRescue PWA.
   - User inputs vehicle, fuel type (Petrol/Diesel), quantity (3L–15L), and location.
   - A unique client-side UUID (`client_request_id`) is minted.
   - Request is immediately written to Dexie IndexedDB with status `PENDING_SYNC`.
   - Visual banner notifies user that request is securely stored offline.
2. When cellular connectivity resumes:
   - `online` event or Service Worker background sync triggers `triggerSync()`.
   - The queue issues an idempotent `POST /api/v1/requests/sync`.
   - Server checks `findByClientRequestId`. If existing, returns the confirmed record (zero duplicate charges).
   - Server generates server ID (`FR-2026-XXXX`), assigns matching status, and persists in Aiven PostgreSQL.
   - Client updates local record to `SYNCED`.
