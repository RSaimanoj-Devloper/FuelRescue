# FuelRescue — Acceptance Testing & Verification Guide

This guide details the test cases corresponding to Section 11 of the specification (Tests A through L).

| Test | Objective | Procedure | Expected Result | Verified Status |
|---|---|---|---|---|
| **Test A: Normal Online Request** | Driver creates emergency request with internet | Fill form, select 5L Petrol on NH 44, submit | Backend assigns `FR-2026-XXXX`, status `MATCHING`, returns 201 | **VERIFIED** |
| **Test B: Offline Request** | Request creation without network | Click "Simulate Offline Mode" banner or disconnect wifi, submit request | Saved in Dexie IndexedDB with `PENDING_SYNC` and client UUID. Survives refresh. | **VERIFIED** |
| **Test C: Automatic Sync** | Background synchronization on reconnect | Restore network or click "Exit Offline Simulation" | Sync engine triggers, sends request to `/api/v1/requests/sync`, updates to `SYNCED` with server ID | **VERIFIED** |
| **Test D: Duplicate Prevention** | Idempotent submission of same clientRequestId | Re-sync same request repeatedly | Database checks unique constraint on `client_request_id`, returns HTTP 200 with existing ID without duplicates | **VERIFIED** |
| **Test E: Sync Failure Preservation** | Graceful error handling | Submit with invalid network endpoint | Request status marked `SYNC_FAILED`, retry count incremented, data preserved in IndexedDB | **VERIFIED** |
| **Test F: Provider Workflow** | Provider claims and advances job | Switch role to "Assistance Provider", click "Claim Request", then advance to Dispatched -> Arriving -> Delivered -> Completed | Driver tracker updates in real-time to match provider status | **VERIFIED** |
| **Test G: Authorization & RBAC** | Role separation | Review role views | Driver cannot access provider claim controls or admin audit logs | **VERIFIED** |
| **Test H: QR Identification** | Opaque vehicle verification | Open "Show Vehicle Pass", scan or simulate provider check | Windshield QR pass displays opaque token and verified vehicle model without leaking PII | **VERIFIED** |
| **Test I: Location Fallback** | GPS unavailable handling | Deny GPS or click Highway presets (NH 44 Medchal, NH 65 Choutuppal) | Coordinates & description auto-populate smoothly | **VERIFIED** |
| **Test J: Responsive Interface** | Mobile, tablet, desktop viewports | Resize browser from 375px mobile to 1440px desktop | Mobile tab bar & desktop top bar render with zero overflow or wrapping | **VERIFIED** |
| **Test K: Aiven Database** | Relational persistence | Inspect Flyway `V1__init_schema.sql` & Spring JPA entities | Clean normalized schema with indexes and foreign keys | **VERIFIED** |
| **Test L: Payment Integrity** | Sandbox simulated checkout | Click "Complete Payment (Sandbox)" on tracker | Explicit sandbox disclaimer shown, generates transaction reference, prevents duplicate charges | **VERIFIED** |
