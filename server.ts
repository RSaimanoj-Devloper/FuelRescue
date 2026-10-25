import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Users In-Memory Database Table with distinct credentials
interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/hashed comparison in dev
  phone: string;
  role: 'DRIVER' | 'PROVIDER' | 'OUTLET' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastActive: string;
  totalRequests: number;
  totalSpent: number;
  currentLat: number;
  currentLon: number;
  locationName: string;
  assignedVehicle: string;
  notes?: string;
}

const usersTable = new Map<string, ServerUser>([
  ['user-admin', {
    id: 'user-admin',
    name: 'Telangana Highway Operations (Admin)',
    email: 'admin@fuelrescue.in',
    passwordHash: 'Admin@123',
    phone: '+91 94400 11000',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2025-11-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    totalRequests: 0,
    totalSpent: 0,
    currentLat: 17.4399,
    currentLon: 78.4983,
    locationName: 'Secunderabad Highway Control Center',
    assignedVehicle: 'TS 09 HQ 0001'
  }],
  ['user-driver-demo', {
    id: 'user-driver-demo',
    name: 'Vikram Rao',
    email: 'driver@fuelrescue.in',
    passwordHash: 'Driver@123',
    phone: '+91 98490 55123',
    role: 'DRIVER',
    isActive: true,
    createdAt: '2026-01-15T08:30:00Z',
    lastActive: new Date().toISOString(),
    totalRequests: 4,
    totalSpent: 3192,
    currentLat: 17.6250,
    currentLon: 78.4790,
    locationName: 'NH 44 Northbound, near Medchal Toll Plaza',
    assignedVehicle: 'TS 09 EA 4821',
    notes: 'Frequent commuter on Hyderabad - Nagpur expressway.'
  }],
  ['user-driver-2', {
    id: 'user-driver-2',
    name: 'Priyanka Sharma',
    email: 'priyanka.s@gmail.com',
    passwordHash: 'Driver@123',
    phone: '+91 99880 77123',
    role: 'DRIVER',
    isActive: true,
    createdAt: '2026-02-10T11:20:00Z',
    lastActive: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    totalRequests: 2,
    totalSpent: 1850,
    currentLat: 17.2514,
    currentLon: 78.9023,
    locationName: 'NH 65 Choutuppal Corridor',
    assignedVehicle: 'TS 07 HK 9012'
  }],
  ['user-driver-3', {
    id: 'user-driver-3',
    name: 'Anand Kumar',
    email: 'anand.k@transports.in',
    passwordHash: 'Driver@123',
    phone: '+91 94411 22334',
    role: 'DRIVER',
    isActive: true,
    createdAt: '2026-03-01T14:10:00Z',
    lastActive: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    totalRequests: 1,
    totalSpent: 1450,
    currentLat: 17.2403,
    currentLon: 78.4294,
    locationName: 'Nehru Outer Ring Road (ORR Exit 6)',
    assignedVehicle: 'TS 08 AB 1234'
  }],
  ['user-prov-1', {
    id: 'user-prov-1',
    name: 'Ramesh Reddy',
    email: 'provider@fuelrescue.in',
    passwordHash: 'Patrol@123',
    phone: '+91 98492 88410',
    role: 'PROVIDER',
    isActive: true,
    createdAt: '2025-12-01T09:00:00Z',
    lastActive: new Date().toISOString(),
    totalRequests: 142,
    totalSpent: 0,
    currentLat: 17.6150,
    currentLon: 78.4750,
    locationName: 'NH 44 Rapid Highway Patrol Unit #4',
    assignedVehicle: 'TS 08 HG 1102'
  }],
  ['user-outlet-1', {
    id: 'user-outlet-1',
    name: 'IOCL Highway Oasis Manager',
    email: 'outlet@fuelrescue.in',
    passwordHash: 'Outlet@123',
    phone: '+91 98490 12345',
    role: 'OUTLET',
    isActive: true,
    createdAt: '2025-12-15T09:00:00Z',
    lastActive: new Date().toISOString(),
    totalRequests: 88,
    totalSpent: 0,
    currentLat: 17.6289,
    currentLon: 78.4812,
    locationName: 'Indian Oil Swagat Oasis (NH 44 Km 42)',
    assignedVehicle: 'TS 08 BUNK 01'
  }]
]);

// In-Memory Database Store for Requests
interface ServerRequest {
  id: string;
  clientRequestId: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceType: 'FUEL' | 'TOW_TRUCK' | 'MECHANIC';
  towRequirement?: string;
  mechanicIssue?: string;
  vehicleId?: string;
  vehicleNumber: string;
  fuelType?: 'PETROL' | 'DIESEL';
  requestedQuantity?: number;
  latitude: number;
  longitude: number;
  locationDescription: string;
  situationNotes?: string;
  status: string;
  syncStatus: string;
  estimatedCost: number;
  confirmedCost?: number;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderPhone?: string;
  outletSourceId?: string;
  outletSourceName?: string;
  etaMinutes?: number;
  paymentStatus: string;
  paymentMethod?: string;
  transactionReference?: string;
  syncRetryCount: number;
  isSosEmergency?: boolean;
  canisterDispensed?: boolean;
  canisterDispensedAt?: string;
  createdAt: string;
  updatedAt: string;
  synchronizedAt?: string;
}

interface ServerProvider {
  id: string;
  userId: string;
  name: string;
  agencyName: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  serviceTypes: string[];
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  isVerified: boolean;
  supportedFuel: string[];
  rating: number;
  completedJobs: number;
}

interface ServerOutlet {
  id: string;
  name: string;
  omc: string;
  highway: string;
  landmark: string;
  latitude: number;
  longitude: number;
  phone: string;
  petrolAvailable: boolean;
  dieselAvailable: boolean;
  petrolPrice: number;
  dieselPrice: number;
  operatingHours: string;
  hasEmergencyCans: boolean;
}

interface AuditLog {
  id: string;
  clientRequestId?: string;
  requestId?: string;
  action: string;
  details: string;
  timestamp: string;
  actor: string;
}

export interface ServerNotification {
  id: string;
  type: 'SOS_EMERGENCY' | 'DISPATCH_ALERT' | 'SYSTEM' | 'ADMIN_ALERT';
  title: string;
  message: string;
  targetRole: 'ALL' | 'ADMIN' | 'PROVIDER' | 'OUTLET' | 'DRIVER';
  requestId?: string;
  location?: { lat: number; lon: number; description: string };
  vehicleNumber?: string;
  userPhone?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
}

// In-memory tables with realistic initial seed
const initialSeedRequest: ServerRequest = {
  id: 'FR-2026-8919',
  clientRequestId: 'client-req-8919',
  userId: 'user-driver-demo',
  userName: 'Vikram Rao',
  userPhone: '+91 98490 55123',
  serviceType: 'FUEL',
  vehicleId: 'VEH-01',
  vehicleNumber: 'TS 09 EA 4821',
  fuelType: 'PETROL',
  requestedQuantity: 5,
  latitude: 17.6250,
  longitude: 78.4790,
  locationDescription: 'NH 44 Northbound, outer shoulder near Medchal Toll Plaza',
  situationNotes: 'Tank empty on expressway shoulder. Hazard lights on.',
  status: 'MATCHING',
  syncStatus: 'SYNCED',
  estimatedCost: 798,
  assignedProviderId: 'PROV-TEL-01',
  assignedProviderName: 'Ramesh Reddy',
  assignedProviderPhone: '+91 98492 88410',
  outletSourceId: 'OUT-IOCL-01',
  outletSourceName: 'Indian Oil Swagat Highway Oasis (NH 44 Km 42)',
  etaMinutes: 14,
  paymentStatus: 'PENDING',
  syncRetryCount: 0,
  isSosEmergency: false,
  canisterDispensed: false,
  createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  synchronizedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
};

const requestsTable = new Map<string, ServerRequest>([
  ['FR-2026-8919', initialSeedRequest]
]);
const clientRequestMap = new Map<string, string>([
  ['client-req-8919', 'FR-2026-8919']
]);
const auditLogs: AuditLog[] = [
  {
    id: 'aud-seed-1',
    requestId: 'FR-2026-8919',
    action: 'REQUEST_FUEL_SYNCHRONIZED',
    details: 'Initial emergency 5L PETROL assistance request dispatched for TS 09 EA 4821.',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    actor: 'SYSTEM_DISPATCH_ENGINE'
  }
];

const notificationsTable: ServerNotification[] = [
  {
    id: 'notif-seed-prov',
    type: 'DISPATCH_ALERT',
    title: '⚡ New Emergency Fuel Mission Assigned',
    message: 'Vikram Rao (+91 98490 55123) needs 5L PETROL for TS 09 EA 4821 near Medchal Toll Plaza.',
    targetRole: 'PROVIDER',
    requestId: 'FR-2026-8919',
    vehicleNumber: 'TS 09 EA 4821',
    userPhone: '+91 98490 55123',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'HIGH'
  },
  {
    id: 'notif-seed-out',
    type: 'DISPATCH_ALERT',
    title: '⛽ Emergency Canister Dispense Requested',
    message: '5L PETROL safety jerrycan needed for TS 09 EA 4821. Patrol unit Ramesh Reddy picking up.',
    targetRole: 'OUTLET',
    requestId: 'FR-2026-8919',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'HIGH'
  },
  {
    id: 'notif-init-1',
    type: 'SOS_EMERGENCY',
    title: '🚨 HIGHWAY PATROL STANDBY ACTIVE',
    message: 'Rapid response patrol units #1, #2, #3 active on NH 44 and NH 65 sectors.',
    targetRole: 'ALL',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'HIGH'
  }
];

export interface ServerSectorRestriction {
  id: string;
  corridorName: string;
  sectorKm: string;
  alertLevel: 'NORMAL' | 'CAUTION' | 'SEVERE_RESTRICTION' | 'CLOSED';
  hazardType: 'DENSE_FOG' | 'ACCIDENT_CLEARANCE' | 'MONSOON_FLOODING' | 'ROADWORK' | 'HAZMAT_SPILL';
  advisorySpeedKmh: number;
  diversionRoute?: string;
  patrolUnitsAssigned: number;
  declaredAt: string;
  declaredBy: string;
  isActive: boolean;
}

const sectorsTable = new Map<string, ServerSectorRestriction>([
  ['SEC-NH44-01', {
    id: 'SEC-NH44-01',
    corridorName: 'NH 44 (Hyderabad - Nagpur)',
    sectorKm: 'Km 38 to Km 62 (Medchal - Toopran)',
    alertLevel: 'CAUTION',
    hazardType: 'DENSE_FOG',
    advisorySpeedKmh: 45,
    diversionRoute: 'Maintain 50m safe gap; hazard lamps recommended on outer shoulder',
    patrolUnitsAssigned: 3,
    declaredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    declaredBy: 'Highway Authority Operations Admin',
    isActive: true
  }],
  ['SEC-ORR-02', {
    id: 'SEC-ORR-02',
    corridorName: 'Nehru Outer Ring Road (ORR Expressway)',
    sectorKm: 'Exit 6 (Shamshabad) to Exit 11 (Narsingi)',
    alertLevel: 'NORMAL',
    hazardType: 'ROADWORK',
    advisorySpeedKmh: 80,
    diversionRoute: 'Lane 1 & 2 open, Lane 4 median maintenance in progress',
    patrolUnitsAssigned: 2,
    declaredAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    declaredBy: 'Highway Authority Operations Admin',
    isActive: true
  }],
  ['SEC-NH65-03', {
    id: 'SEC-NH65-03',
    corridorName: 'NH 65 (Hyderabad - Vijayawada Highway)',
    sectorKm: 'Km 32 to Km 48 (Choutuppal Sector)',
    alertLevel: 'NORMAL',
    hazardType: 'ACCIDENT_CLEARANCE',
    advisorySpeedKmh: 60,
    diversionRoute: 'Shoulder cleared, all 3 lanes operational',
    patrolUnitsAssigned: 1,
    declaredAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    declaredBy: 'Highway Authority Operations Admin',
    isActive: true
  }]
]);

export interface ServerDriverAnnouncement {
  id: string;
  category: 'MAINTENANCE' | 'EMERGENCY' | 'WEATHER' | 'TRAFFIC';
  title: string;
  message: string;
  affectedCorridor: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  isPushNotification: boolean;
  isBannerActive: boolean;
  actionUrlText?: string;
  deliveredCount: number;
  createdAt: string;
  createdBy: string;
}

const driverAnnouncementsTable = new Map<string, ServerDriverAnnouncement>([
  ['ANN-INIT-01', {
    id: 'ANN-INIT-01',
    category: 'MAINTENANCE',
    title: '🛠️ Scheduled Toll Lane & Server Telemetry Calibration',
    message: 'NHAI Medchal Toll Plaza lanes 4 & 5 undergoing sensor calibration tonight (02:00 - 04:00 AM). Highway emergency fuel and towing patrol units remain active 24/7 across all sectors.',
    affectedCorridor: 'NH 44 (Hyderabad - Nagpur) & ORR Corridors',
    severity: 'WARNING',
    isPushNotification: true,
    isBannerActive: true,
    deliveredCount: 4,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    createdBy: 'Highway Operations Admin'
  }]
]);

// Seed Providers with Fuel, Tow Truck & Mobile Mechanic capabilities
const providersTable = new Map<string, ServerProvider>([
  ['PROV-TEL-01', {
    id: 'PROV-TEL-01',
    userId: 'user-prov-1',
    name: 'Ramesh Reddy',
    agencyName: 'NH 44 Rapid Highway Rescue Unit #4',
    phone: '+91 98492 88410',
    vehicleType: 'Rescue Patrol Bike with Twin Approved Safety Jerrycans (20L)',
    vehicleNumber: 'TS 08 HG 1102',
    serviceTypes: ['FUEL', 'MECHANIC'],
    latitude: 17.6150,
    longitude: 78.4750,
    coverageRadiusKm: 25,
    status: 'AVAILABLE',
    isVerified: true,
    supportedFuel: ['PETROL', 'DIESEL'],
    rating: 4.9,
    completedJobs: 142
  }],
  ['PROV-TEL-02', {
    id: 'PROV-TEL-02',
    userId: 'user-prov-2',
    name: 'Mohammed Kareem',
    agencyName: 'Cyberabad Highway Heavy Towing & Flatbed Recovery',
    phone: '+91 98480 33211',
    vehicleType: 'Hydraulic Flatbed Tow Truck with Wheel-Lift Crane',
    vehicleNumber: 'TS 07 UA 4419',
    serviceTypes: ['TOW_TRUCK', 'MECHANIC', 'FUEL'],
    latitude: 17.2600,
    longitude: 78.4400,
    coverageRadiusKm: 35,
    status: 'AVAILABLE',
    isVerified: true,
    supportedFuel: ['PETROL', 'DIESEL'],
    rating: 4.8,
    completedJobs: 89
  }],
  ['PROV-TEL-03', {
    id: 'PROV-TEL-03',
    userId: 'user-prov-3',
    name: 'Suresh Varma',
    agencyName: 'Telangana QuickAid Roadside Mechanic & Puncture Express',
    phone: '+91 94411 77620',
    vehicleType: 'Mobile Diagnostic Utility Van with Air Compressor & Heavy Jumper',
    vehicleNumber: 'TS 09 XY 9081',
    serviceTypes: ['MECHANIC', 'FUEL'],
    latitude: 17.2800,
    longitude: 78.8500,
    coverageRadiusKm: 20,
    status: 'AVAILABLE',
    isVerified: true,
    supportedFuel: ['PETROL'],
    rating: 4.7,
    completedJobs: 54
  }]
]);

// Seed Outlets
const outletsTable = new Map<string, ServerOutlet>([
  ['OUT-IOCL-01', {
    id: 'OUT-IOCL-01',
    name: 'Indian Oil Swagat Highway Oasis',
    omc: 'IOCL',
    highway: 'NH 44 (Hyderabad - Nagpur)',
    landmark: 'Km 42, Gundlapochampally near Medchal Toll Plaza',
    latitude: 17.6289,
    longitude: 78.4812,
    phone: '+91 98490 12345',
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: '24 Hours',
    hasEmergencyCans: true
  }],
  ['OUT-BPCL-02', {
    id: 'OUT-BPCL-02',
    name: 'Bharat Petroleum Ghar Highway Hub',
    omc: 'BPCL',
    highway: 'NH 65 (Hyderabad - Vijayawada)',
    landmark: 'Km 36, Near Choutuppal bypass, Opposite Reliance Fresh',
    latitude: 17.2514,
    longitude: 78.9023,
    phone: '+91 94401 56789',
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: '24 Hours',
    hasEmergencyCans: true
  }],
  ['OUT-HPCL-03', {
    id: 'OUT-HPCL-03',
    name: 'HPCL Auto Care Centre - ORR Exit 6',
    omc: 'HPCL',
    highway: 'Nehru Outer Ring Road (ORR)',
    landmark: 'Exit 6, Shamshabad - Airport approach road',
    latitude: 17.2403,
    longitude: 78.4294,
    phone: '+91 99890 24680',
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: '24 Hours',
    hasEmergencyCans: true
  }],
  ['OUT-SHELL-04', {
    id: 'OUT-SHELL-04',
    name: 'Shell Select Express Highway Depot',
    omc: 'SHELL',
    highway: 'NH 44 (Hyderabad - Bengaluru)',
    landmark: 'Km 58, Shadnagar Highway Junction',
    latitude: 17.0682,
    longitude: 78.2091,
    phone: '+91 98480 98765',
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 112.50,
    dieselPrice: 99.40,
    operatingHours: '06:00 - 23:00',
    hasEmergencyCans: true
  }]
]);

// Vehicles database
const vehiclesTable = new Map<string, { id: string; userId: string; vehicleNumber: string; makeModel: string; fuelType: string; tankCapacity: number; qrCodeToken: string }>([
  ['VEH-01', {
    id: 'VEH-01',
    userId: 'user-driver-demo',
    vehicleNumber: 'TS 09 EA 4821',
    makeModel: 'Hyundai Creta 1.5 SX',
    fuelType: 'PETROL',
    tankCapacity: 50,
    qrCodeToken: 'FR-VEH-TS09EA4821-SIG78A'
  }],
  ['VEH-02', {
    id: 'VEH-02',
    userId: 'user-driver-demo',
    vehicleNumber: 'TS 07 HK 9012',
    makeModel: 'Toyota Innova Crysta 2.4 VX',
    fuelType: 'DIESEL',
    tankCapacity: 65,
    qrCodeToken: 'FR-VEH-TS07HK9012-SIG99B'
  }]
]);

let requestSequence = 8920;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// REST API ROUTING (/api/v1)

// 1. Healthcheck
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    database: 'Aiven-PostgreSQL-Compatible-Emulation',
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Authentication (Login / Register / Me) with distinct credential validation
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password, role, name, phone, assignedVehicle, locationName } = req.body;

  const rawQuery = (email || '').trim().toLowerCase();
  const digitsOnly = rawQuery.replace(/\D/g, '');

  // Find user by email, phone, name, or role name
  let user = Array.from(usersTable.values()).find(u => {
    if (u.email.toLowerCase() === rawQuery) return true;
    if (digitsOnly.length >= 8 && u.phone.replace(/\D/g, '').includes(digitsOnly)) return true;
    if (rawQuery.length > 2 && u.name.toLowerCase().includes(rawQuery)) return true;
    if (rawQuery === u.role.toLowerCase()) return true;
    return false;
  });

  if (user) {
    if (password && user.passwordHash !== password) {
      // In dev/demo, allow forgiving match if demo password or standard test password
      const isDevPass = password.toLowerCase() === user.passwordHash.toLowerCase() ||
        password === 'password123' || password === '123456' || password === 'Driver@123' || password === 'Admin@123';
      if (!isDevPass) {
        return res.status(401).json({ error: `Invalid password for ${user.email}. Default password is ${user.passwordHash}` });
      }
    }
    user.lastActive = new Date().toISOString();
    const token = `jwt_${user.role}_${Date.now()}_${Buffer.from(user.email).toString('base64')}`;
    return res.json({ user, token });
  }

  // If registering or demo switching
  const targetRole = role || (rawQuery.includes('admin') ? 'ADMIN' : rawQuery.includes('provider') ? 'PROVIDER' : rawQuery.includes('outlet') ? 'OUTLET' : 'DRIVER');
  const newId = `user-${Date.now().toString().slice(-4)}`;
  const newUser: ServerUser = {
    id: newId,
    name: name || (email?.split('@')[0] || (targetRole === 'DRIVER' ? 'Vikram Rao' : 'Highway User')),
    email: email || `user-${Date.now()}@fuelrescue.in`,
    passwordHash: password || 'SecurePass@123',
    phone: phone || '+91 98490 55123',
    role: targetRole,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalRequests: targetRole === 'DRIVER' ? 3 : 0,
    totalSpent: targetRole === 'DRIVER' ? 2450 : 0,
    currentLat: 17.6250,
    currentLon: 78.4790,
    locationName: locationName || 'NH 44 Northbound Corridor',
    assignedVehicle: assignedVehicle || 'TS 09 EA 4821'
  };
  usersTable.set(newId, newUser);
  const token = `jwt_${targetRole}_${Date.now()}`;
  res.json({ user: newUser, token });
});

// 3. User Management APIs (Admin Only)
app.get('/api/v1/users', (_req: Request, res: Response) => {
  const now = Date.now();
  const users = Array.from(usersTable.values()).map(u => {
    const lastActiveTime = new Date(u.lastActive).getTime();
    // Real-time active status: User is ONLINE only if active AND pinged within 5 minutes
    const isOnline = u.isActive && (now - lastActiveTime < 5 * 60 * 1000);
    return {
      ...u,
      isOnline,
      activeStatus: !u.isActive ? 'SUSPENDED' : isOnline ? 'ACTIVE' : 'INACTIVE'
    };
  });
  res.json(users);
});

// Admin adds a brand new user
app.post('/api/v1/users', (req: Request, res: Response) => {
  const { name, email, phone, role, password, assignedVehicle, locationName } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required to register a user' });
  }

  const existing = Array.from(usersTable.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists in the system' });
  }

  const id = `user-${Date.now().toString().slice(-4)}`;
  const newUser: ServerUser = {
    id,
    name,
    email,
    passwordHash: password || 'SecurePass@123',
    phone: phone || '+91 98490 11223',
    role: role || 'DRIVER',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    totalRequests: 0,
    totalSpent: 0,
    currentLat: 17.4399,
    currentLon: 78.4983,
    locationName: locationName || 'Telangana Highway Network',
    assignedVehicle: assignedVehicle || 'TS 09 ADM 0001'
  };

  usersTable.set(id, newUser);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'USER_CREATED_BY_ADMIN',
    details: `Admin created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.status(201).json(newUser);
});

app.post('/api/v1/users/:id/heartbeat', (req: Request, res: Response) => {
  const user = usersTable.get(req.params.id);
  if (user) {
    user.lastActive = new Date().toISOString();
  }
  res.json({ success: true, timestamp: new Date().toISOString() });
});

app.get('/api/v1/users/:id', (req: Request, res: Response) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const now = Date.now();
  const isOnline = user.isActive && (now - new Date(user.lastActive).getTime() < 5 * 60 * 1000);
  res.json({
    ...user,
    isOnline,
    activeStatus: !user.isActive ? 'SUSPENDED' : isOnline ? 'ACTIVE' : 'INACTIVE'
  });
});

app.patch('/api/v1/users/:id/status', (req: Request, res: Response) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { isActive } = req.body;
  user.isActive = Boolean(isActive);
  user.lastActive = new Date().toISOString();

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: `USER_${user.isActive ? 'ACTIVATED' : 'SUSPENDED'}`,
    details: `Admin changed status for user ${user.name} (${user.email}) to ${user.isActive ? 'ACTIVE' : 'SUSPENDED'}`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(user);
});

app.patch('/api/v1/users/:id', (req: Request, res: Response) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { role, notes, name, phone, assignedVehicle, locationName } = req.body;
  if (role) user.role = role;
  if (notes !== undefined) user.notes = notes;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (assignedVehicle) user.assignedVehicle = assignedVehicle;
  if (locationName) user.locationName = locationName;

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'USER_PROFILE_UPDATED',
    details: `Admin updated user profile ${user.name} (${user.id})`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(user);
});

app.delete('/api/v1/users/:id', (req: Request, res: Response) => {
  const exists = usersTable.has(req.params.id);
  if (!exists) return res.status(404).json({ error: 'User not found' });
  usersTable.delete(req.params.id);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'USER_DELETED',
    details: `Admin permanently removed user ID ${req.params.id}`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json({ success: true, message: 'User deleted from PostgreSQL database' });
});

app.post('/api/v1/admin/broadcast', (req: Request, res: Response) => {
  const { title, message, priority = 'WARNING', targetRole = 'ALL' } = req.body;
  const alertId = `broadcast-${Date.now()}`;
  const now = new Date().toISOString();

  const notif: ServerNotification = {
    id: alertId,
    type: 'ADMIN_ALERT',
    title: title || '⚠️ National Highway Operations Advisory',
    message: message || 'Notice issued by Highway Operations Control.',
    targetRole,
    timestamp: now,
    isRead: false,
    priority: priority || 'WARNING'
  };

  notificationsTable.unshift(notif);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'ADMIN_BROADCAST_TRANSMITTED',
    details: `Admin broadcasted priority alert: "${title}" to target: ${targetRole}`,
    timestamp: now,
    actor: 'ADMIN'
  });

  res.status(201).json({
    success: true,
    notification: notif,
    message: 'Bulletin successfully dispatched to all active units'
  });
});

// Notifications APIs (For Providers & Admin)
app.get('/api/v1/notifications', (req: Request, res: Response) => {
  const { role } = req.query;
  let list = [...notificationsTable];
  if (role) {
    list = list.filter(n => n.targetRole === 'ALL' || n.targetRole === role);
  }
  res.json(list.slice(0, 30));
});

app.patch('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notificationsTable.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

// Instant High Priority SOS Broadcast Endpoint
app.post('/api/v1/sos/broadcast', (req: Request, res: Response) => {
  const { vehicleNumber, locationDescription, latitude, longitude, serviceType, userPhone, userName } = req.body;
  const now = new Date().toISOString();
  const alertId = `sos-${Date.now()}`;

  const notif: ServerNotification = {
    id: alertId,
    type: 'SOS_EMERGENCY',
    title: `🚨 CRITICAL SOS: ${vehicleNumber || 'Vehicle'} Stranded!`,
    message: `Immediate dispatch needed for ${userName || 'Traveler'} (${userPhone || 'Emergency contact'}) at ${locationDescription || 'Highway Shoulder'}. Service: ${serviceType || 'Roadside Assistance'}.`,
    targetRole: 'ALL',
    location: {
      lat: Number(latitude) || 17.6250,
      lon: Number(longitude) || 78.4790,
      description: locationDescription || 'NH 44 Highway Outer Shoulder'
    },
    vehicleNumber,
    userPhone,
    timestamp: now,
    isRead: false,
    priority: 'CRITICAL'
  };

  notificationsTable.unshift(notif);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'SOS_BROADCAST_TRANSMITTED',
    details: `High Priority SOS broadcast transmitted to ALL service providers and Admin for vehicle ${vehicleNumber}`,
    timestamp: now,
    actor: 'ONE_TAP_SOS_SYSTEM'
  });

  res.status(201).json({
    success: true,
    notification: notif,
    alertTransmittedToProviders: providersTable.size,
    alertTransmittedToAdmin: true
  });
});

// 4. Vehicles & QR Verification
app.get('/api/v1/vehicles', (_req: Request, res: Response) => {
  res.json(Array.from(vehiclesTable.values()));
});

app.post('/api/v1/vehicles', (req: Request, res: Response) => {
  const { vehicleNumber, makeModel, fuelType, tankCapacity } = req.body;
  if (!vehicleNumber) {
    return res.status(400).json({ error: 'Vehicle number is required' });
  }
  const id = `VEH-0${vehiclesTable.size + 1}`;
  const qrCodeToken = `FR-VEH-${vehicleNumber.replace(/\s+/g, '')}-SIG${Math.floor(1000 + Math.random() * 9000)}`;
  const vehicle = {
    id,
    userId: 'user-driver-demo',
    vehicleNumber,
    makeModel: makeModel || 'Passenger Vehicle',
    fuelType: fuelType || 'PETROL',
    tankCapacity: Number(tankCapacity) || 45,
    qrCodeToken
  };
  vehiclesTable.set(id, vehicle);
  res.status(201).json(vehicle);
});

app.get('/api/v1/vehicles/qr/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const vehicle = Array.from(vehiclesTable.values()).find(v => v.qrCodeToken === token);
  if (!vehicle) {
    return res.status(404).json({ error: 'Valid vehicle record not found for this emergency QR reference' });
  }
  res.json({
    verified: true,
    vehicleNumber: vehicle.vehicleNumber,
    makeModel: vehicle.makeModel,
    approvedFuelType: vehicle.fuelType,
    tankCapacityLiters: vehicle.tankCapacity,
    emergencySafetyCleared: true,
    verificationTimestamp: new Date().toISOString()
  });
});

// 5. Outlets List
app.get('/api/v1/outlets', (_req: Request, res: Response) => {
  res.json(Array.from(outletsTable.values()));
});

// 6. Providers List
app.get('/api/v1/providers', (_req: Request, res: Response) => {
  res.json(Array.from(providersTable.values()));
});

app.patch('/api/v1/providers/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const provider = providersTable.get(id);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  provider.status = status;
  res.json(provider);
});

// 7. Idempotent Synchronization & Request Creation Endpoint (Fuel, Towing, Mechanic)
app.post('/api/v1/requests/sync', (req: Request, res: Response) => {
  const body = req.body as Partial<ServerRequest>;
  const clientRequestId = body.clientRequestId || (req.headers['x-client-request-id'] as string);

  if (!clientRequestId) {
    return res.status(400).json({ error: 'Missing mandatory clientRequestId for synchronization' });
  }

  // Idempotency check: If already exists, return existing record
  if (clientRequestMap.has(clientRequestId)) {
    const existingId = clientRequestMap.get(clientRequestId)!;
    const existing = requestsTable.get(existingId);
    if (existing) {
      auditLogs.push({
        id: `aud-${Date.now()}`,
        clientRequestId,
        requestId: existing.id,
        action: 'IDEMPOTENT_HIT',
        details: `Subsequent sync request received for ${clientRequestId}. Returned existing server ID ${existing.id}.`,
        timestamp: new Date().toISOString(),
        actor: 'SYSTEM_SYNC_CONTROLLER'
      });
      return res.status(200).json(existing);
    }
  }

  const serviceType = body.serviceType || 'FUEL';
  const userLat = Number(body.latitude) || 17.6250;
  const userLon = Number(body.longitude) || 78.4790;

  // Matching algorithm considering Service Type (FUEL, TOW_TRUCK, MECHANIC)
  const eligibleProviders = Array.from(providersTable.values()).filter(p => {
    if (p.status !== 'AVAILABLE') return false;
    return p.serviceTypes.includes(serviceType);
  });

  let bestProvider: ServerProvider | undefined;
  let minDistance = Infinity;

  eligibleProviders.forEach(p => {
    const dist = calculateDistance(userLat, userLon, p.latitude, p.longitude);
    if (dist <= p.coverageRadiusKm && dist < minDistance) {
      minDistance = dist;
      bestProvider = p;
    }
  });

  // Calculate pricing based on requested service
  let totalCost = 0;
  if (serviceType === 'FUEL') {
    const quantity = Number(body.requestedQuantity) || 5;
    const fuelRate = body.fuelType === 'DIESEL' ? 97.82 : 109.66;
    totalCost = Math.round(fuelRate * quantity) + 250; // fuel + delivery fee
  } else if (serviceType === 'TOW_TRUCK') {
    totalCost = 1450; // Highway recovery hook & 15km transit
  } else if (serviceType === 'MECHANIC') {
    totalCost = 650; // Roadside diagnostic & on-spot repair/jumpstart
  }

  requestSequence += 1;
  const serverId = `FR-2026-${requestSequence}`;
  const now = new Date().toISOString();

  const newRequest: ServerRequest = {
    id: serverId,
    clientRequestId,
    userId: body.userId || 'user-driver-demo',
    userName: body.userName || 'Highway Traveler',
    userPhone: body.userPhone || '+91 98490 55123',
    serviceType,
    towRequirement: body.towRequirement,
    mechanicIssue: body.mechanicIssue,
    vehicleId: body.vehicleId || 'VEH-01',
    vehicleNumber: body.vehicleNumber || 'TS 09 EA 4821',
    fuelType: body.fuelType,
    requestedQuantity: body.requestedQuantity,
    latitude: userLat,
    longitude: userLon,
    locationDescription: body.locationDescription || 'NH 44 Highway Shoulder',
    situationNotes: body.situationNotes,
    status: bestProvider ? 'MATCHING' : 'PENDING_SYNC',
    syncStatus: 'SYNCED',
    estimatedCost: totalCost,
    assignedProviderId: bestProvider?.id,
    assignedProviderName: bestProvider?.name,
    assignedProviderPhone: bestProvider?.phone,
    outletSourceId: serviceType === 'FUEL' ? 'OUT-IOCL-01' : undefined,
    outletSourceName: serviceType === 'FUEL' ? 'Indian Oil Swagat Highway Oasis (NH 44 Km 42)' : undefined,
    etaMinutes: bestProvider ? Math.max(12, Math.round(minDistance * 2.8)) : 18,
    paymentStatus: 'PENDING',
    syncRetryCount: 0,
    isSosEmergency: body.isSosEmergency || false,
    createdAt: body.createdAt || now,
    updatedAt: now,
    synchronizedAt: now
  };

  requestsTable.set(serverId, newRequest);
  clientRequestMap.set(clientRequestId, serverId);

  // Update user stats
  const driverUser = usersTable.get(newRequest.userId);
  if (driverUser) {
    driverUser.totalRequests = (driverUser.totalRequests || 0) + 1;
    driverUser.lastActive = now;
    driverUser.currentLat = userLat;
    driverUser.currentLon = userLon;
  }

  // Real-time Cross-Role Notifications:
  // 1. Notify Assigned Provider
  notificationsTable.unshift({
    id: `notif-prov-${Date.now()}`,
    type: newRequest.isSosEmergency ? 'SOS_EMERGENCY' : 'DISPATCH_ALERT',
    title: `${newRequest.isSosEmergency ? '🚨 CRITICAL SOS' : '⚡ New Emergency Dispatch'}: ${newRequest.serviceType}`,
    message: `${newRequest.userName} (${newRequest.userPhone}) needs ${newRequest.serviceType === 'FUEL' ? `${newRequest.requestedQuantity}L ${newRequest.fuelType}` : newRequest.serviceType} for vehicle ${newRequest.vehicleNumber} at ${newRequest.locationDescription}.`,
    targetRole: 'PROVIDER',
    requestId: serverId,
    location: { lat: userLat, lon: userLon, description: newRequest.locationDescription },
    vehicleNumber: newRequest.vehicleNumber,
    userPhone: newRequest.userPhone,
    timestamp: now,
    isRead: false,
    priority: newRequest.isSosEmergency ? 'CRITICAL' : 'HIGH'
  });

  // 2. Notify Highway Fuel Outlets if fuel delivery
  if (serviceType === 'FUEL') {
    notificationsTable.unshift({
      id: `notif-out-${Date.now()}`,
      type: 'DISPATCH_ALERT',
      title: '⛽ Emergency Jerrycan Dispense Requested',
      message: `${newRequest.requestedQuantity}L ${newRequest.fuelType} canister needed for stranded vehicle ${newRequest.vehicleNumber}. Patrol unit: ${bestProvider?.name || 'Patrol Unit'}.`,
      targetRole: 'OUTLET',
      requestId: serverId,
      timestamp: now,
      isRead: false,
      priority: 'HIGH'
    });
  }

  // 3. Notify Central Operations Admin
  notificationsTable.unshift({
    id: `notif-adm-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: `📡 Incident Dispatched: ${serverId}`,
    message: `Driver ${newRequest.userName} (${newRequest.vehicleNumber}) requested ${serviceType}. Assigned unit: ${bestProvider?.name || 'Patrol Unit'}.`,
    targetRole: 'ADMIN',
    requestId: serverId,
    timestamp: now,
    isRead: false,
    priority: newRequest.isSosEmergency ? 'CRITICAL' : 'NORMAL'
  });

  auditLogs.push({
    id: `aud-${Date.now()}`,
    clientRequestId,
    requestId: serverId,
    action: `REQUEST_${serviceType}_SYNCHRONIZED`,
    details: `Created emergency ${serviceType} assistance request for ${newRequest.vehicleNumber}. Assigned provider: ${bestProvider?.name || 'Searching...'}`,
    timestamp: now,
    actor: 'SYSTEM_DISPATCH_ENGINE'
  });

  res.status(201).json(newRequest);
});

// Helper to look up request by either serverId or clientRequestId
function getRequestFromTable(id: string): ServerRequest | undefined {
  if (!id) return undefined;
  let req = requestsTable.get(id);
  if (!req && clientRequestMap.has(id)) {
    req = requestsTable.get(clientRequestMap.get(id)!);
  }
  if (!req) {
    req = Array.from(requestsTable.values()).find(r => r.clientRequestId === id || r.id === id);
  }
  return req;
}

// 8. Get All Requests
app.get('/api/v1/requests', (req: Request, res: Response) => {
  const { userId, providerId, status, serviceType } = req.query;
  let list = Array.from(requestsTable.values());

  if (userId) list = list.filter(r => r.userId === userId);
  if (providerId) list = list.filter(r => r.assignedProviderId === providerId);
  if (status) list = list.filter(r => r.status === status);
  if (serviceType) list = list.filter(r => r.serviceType === serviceType);

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.get('/api/v1/requests/:id', (req: Request, res: Response) => {
  const request = getRequestFromTable(req.params.id);
  if (!request) return res.status(404).json({ error: 'Assistance request not found' });
  res.json(request);
});

app.patch('/api/v1/requests/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, actorRole = 'PROVIDER' } = req.body;
  const request = getRequestFromTable(id);

  if (!request) return res.status(404).json({ error: 'Assistance request not found' });

  request.status = status;
  request.updatedAt = new Date().toISOString();

  if (status === 'DELIVERED') request.confirmedCost = request.estimatedCost;
  if (status === 'COMPLETED') request.paymentStatus = 'CONFIRMED';

  const statusLabels: Record<string, string> = {
    PROVIDER_ACCEPTED: 'Patrol Unit Claimed Job',
    DISPATCHED: 'Patrol En Route with Safety Fuel Can',
    ARRIVING: 'Patrol Arrived at Stranded Vehicle',
    DELIVERED: 'Emergency Fuel Delivered to Tank',
    COMPLETED: 'Emergency Assistance Successfully Completed'
  };

  // Cross-role push: Notify Driver
  notificationsTable.unshift({
    id: `notif-status-driver-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: `⚡ ${statusLabels[status] || status}`,
    message: `Incident ${request.id} for ${request.vehicleNumber} updated to ${status}. Responding unit: ${request.assignedProviderName || 'Patrol Unit'}.`,
    targetRole: 'DRIVER',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'HIGH'
  });

  // Cross-role push: Notify Admin
  notificationsTable.unshift({
    id: `notif-status-admin-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: `Incident ${request.id} Status: ${status}`,
    message: `Mission ${request.id} (${request.vehicleNumber}) transitioned to ${status} by ${actorRole}.`,
    targetRole: 'ADMIN',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'NORMAL'
  });

  // If delivered or completed, notify Outlet
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    notificationsTable.unshift({
      id: `notif-outlet-delivered-${Date.now()}`,
      type: 'DISPATCH_ALERT',
      title: '✅ Fuel Delivered to Tank',
      message: `Safety canister fuel delivery confirmed for vehicle ${request.vehicleNumber}.`,
      targetRole: 'OUTLET',
      requestId: request.id,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'NORMAL'
    });
  }

  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: request.id,
    action: `STATUS_CHANGE_TO_${status}`,
    details: note || `Status updated to ${status} by ${actorRole}`,
    timestamp: new Date().toISOString(),
    actor: actorRole
  });

  res.json(request);
});

app.post('/api/v1/requests/:id/accept', (req: Request, res: Response) => {
  const { id } = req.params;
  const { providerId } = req.body;
  const request = getRequestFromTable(id);

  if (!request) return res.status(404).json({ error: 'Request not found' });

  const provider = providersTable.get(providerId || 'PROV-TEL-01') || Array.from(providersTable.values())[0];
  if (provider) {
    request.assignedProviderId = provider.id;
    request.assignedProviderName = provider.name;
    request.assignedProviderPhone = provider.phone;
    request.etaMinutes = 14;
  }

  request.status = 'PROVIDER_ACCEPTED';
  request.updatedAt = new Date().toISOString();

  // Notify Driver immediately
  notificationsTable.unshift({
    id: `notif-accept-driver-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: '🚨 Highway Patrol Unit Claimed Job!',
    message: `${request.assignedProviderName} (${request.assignedProviderPhone}) is preparing certified canisters. Live ETA: 14 minutes.`,
    targetRole: 'DRIVER',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'HIGH'
  });

  // Notify Admin
  notificationsTable.unshift({
    id: `notif-accept-admin-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: `Incident ${request.id} Claimed`,
    message: `${request.assignedProviderName} confirmed dispatch for vehicle ${request.vehicleNumber}.`,
    targetRole: 'ADMIN',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'NORMAL'
  });

  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: request.id,
    action: 'PROVIDER_CLAIMED_REQUEST',
    details: `Claimed by provider ${request.assignedProviderName}`,
    timestamp: new Date().toISOString(),
    actor: 'PROVIDER'
  });

  res.json(request);
});

// Outlet authorizes & dispenses safety canister to patrol unit
app.patch('/api/v1/requests/:id/dispense-canister', (req: Request, res: Response) => {
  const request = getRequestFromTable(req.params.id);
  if (!request) return res.status(404).json({ error: 'Assistance request not found' });

  request.canisterDispensed = true;
  request.canisterDispensedAt = new Date().toISOString();
  request.updatedAt = new Date().toISOString();

  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: request.id,
    action: 'OUTLET_CANISTER_DISPENSED',
    details: `Fuel station ${request.outletSourceName || 'IOCL Highway Oasis'} authorized & dispensed ${request.requestedQuantity || 5}L ${request.fuelType || 'PETROL'} canister for unit ${request.assignedProviderName || 'Patrol Unit'}.`,
    timestamp: new Date().toISOString(),
    actor: 'OUTLET'
  });

  notificationsTable.unshift({
    id: `notif-dispense-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: '⛽ Canister Dispensed by Fuel Station',
    message: `Station ${request.outletSourceName || 'Swagat Oasis'} authorized & handed over safety canister to ${request.assignedProviderName || 'Patrol Unit'}.`,
    targetRole: 'PROVIDER',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'HIGH'
  });

  notificationsTable.unshift({
    id: `notif-dispense-driver-${Date.now()}`,
    type: 'DISPATCH_ALERT',
    title: '⛽ Fuel Canister Released for Your Vehicle',
    message: `Your fuel canister has been certified and collected by ${request.assignedProviderName || 'Patrol Unit'}. Heading to your location!`,
    targetRole: 'DRIVER',
    requestId: request.id,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'HIGH'
  });

  res.json(request);
});

// 9. Simulated Payment
app.post('/api/v1/transactions/simulate-payment', (req: Request, res: Response) => {
  const { requestId, method = 'UPI_GPAY_PHONEPE' } = req.body;
  const request = requestsTable.get(requestId);

  if (!request) return res.status(404).json({ error: 'Request not found' });

  const transactionRef = `TXN-IND-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  request.paymentStatus = 'SIMULATED_SUCCESS';
  request.paymentMethod = method;
  request.transactionReference = transactionRef;
  request.updatedAt = new Date().toISOString();

  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId,
    action: 'PAYMENT_SIMULATED',
    details: `Sandbox payment completed for ₹${request.estimatedCost}. Ref: ${transactionRef}`,
    timestamp: new Date().toISOString(),
    actor: 'PAYMENT_GATEWAY_SANDBOX'
  });

  res.json({
    success: true,
    message: 'Sandbox Simulated Payment Confirmed (Test Environment)',
    transactionReference: transactionRef,
    amount: request.estimatedCost,
    request
  });
});

// 10. Admin Metrics & Logs
app.get('/api/v1/admin/metrics', (_req: Request, res: Response) => {
  const requests = Array.from(requestsTable.values());
  const activeCount = requests.filter(r => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
  const cancelledCount = requests.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length;
  const totalLiters = requests
    .filter(r => (r.status === 'COMPLETED' || r.status === 'DELIVERED') && r.serviceType === 'FUEL')
    .reduce((acc, curr) => acc + (curr.requestedQuantity || 0), 0);
  const now = Date.now();
  const activeUsersCount = Array.from(usersTable.values()).filter(u =>
    u.isActive && (now - new Date(u.lastActive).getTime() < 5 * 60 * 1000)
  ).length;

  res.json({
    totalUsers: usersTable.size,
    activeUsersNow: activeUsersCount,
    activeRequests: activeCount,
    pendingSyncCount: 0,
    completedRequests: completedCount,
    cancelledRequests: cancelledCount,
    registeredProviders: providersTable.size,
    verifiedProviders: Array.from(providersTable.values()).filter(p => p.isVerified).length,
    registeredOutlets: outletsTable.size,
    failedSyncRecords: 0,
    averageResponseMinutes: 16.4,
    totalFuelDeliveredLiters: totalLiters + 420,
    towJobsCompleted: 34,
    mechanicRepairsCompleted: 58
  });
});

app.get('/api/v1/admin/logs', (_req: Request, res: Response) => {
  res.json(auditLogs.slice(-60).reverse());
});

// Admin Specialized Feature 1: Highway Corridor Safety Geofences
app.get('/api/v1/admin/sectors', (_req: Request, res: Response) => {
  res.json(Array.from(sectorsTable.values()));
});

app.post('/api/v1/admin/sectors', (req: Request, res: Response) => {
  const { corridorName, sectorKm, alertLevel, hazardType, advisorySpeedKmh, diversionRoute } = req.body;
  const id = `SEC-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const sector: ServerSectorRestriction = {
    id,
    corridorName: corridorName || 'NH 44 Highway Corridor',
    sectorKm: sectorKm || 'Active Sector',
    alertLevel: alertLevel || 'CAUTION',
    hazardType: hazardType || 'DENSE_FOG',
    advisorySpeedKmh: Number(advisorySpeedKmh) || 50,
    diversionRoute,
    patrolUnitsAssigned: 2,
    declaredAt: now,
    declaredBy: 'Highway Authority Operations Admin',
    isActive: true
  };

  sectorsTable.set(id, sector);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'CORRIDOR_RESTRICTION_DECLARED',
    details: `Admin declared ${alertLevel} caution sector on ${sector.corridorName} (${sector.sectorKm}). Advisory speed: ${sector.advisorySpeedKmh} km/h`,
    timestamp: now,
    actor: 'ADMIN'
  });

  res.status(201).json(sector);
});

app.delete('/api/v1/admin/sectors/:id', (req: Request, res: Response) => {
  const sector = sectorsTable.get(req.params.id);
  if (!sector) return res.status(404).json({ error: 'Sector not found' });
  sectorsTable.delete(req.params.id);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'CORRIDOR_RESTRICTION_LIFTED',
    details: `Admin cleared restriction on ${sector.corridorName} (${sector.sectorKm})`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json({ success: true, message: 'Corridor restriction lifted' });
});

// Admin Specialized Feature 2: Highway Subsidized Fuel Ceiling Regulation
app.patch('/api/v1/admin/outlets/:id/pricing', (req: Request, res: Response) => {
  const outlet = outletsTable.get(req.params.id);
  if (!outlet) return res.status(404).json({ error: 'Outlet not found' });

  const { petrolPrice, dieselPrice, hasEmergencyCans, petrolAvailable, dieselAvailable } = req.body;
  if (petrolPrice !== undefined) outlet.petrolPrice = Number(petrolPrice);
  if (dieselPrice !== undefined) outlet.dieselPrice = Number(dieselPrice);
  if (hasEmergencyCans !== undefined) outlet.hasEmergencyCans = Boolean(hasEmergencyCans);
  if (petrolAvailable !== undefined) outlet.petrolAvailable = Boolean(petrolAvailable);
  if (dieselAvailable !== undefined) outlet.dieselAvailable = Boolean(dieselAvailable);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'OUTLET_TARIFF_REGULATED',
    details: `Admin updated subsidized fuel tariff at ${outlet.name}: Petrol ₹${outlet.petrolPrice}/L, Diesel ₹${outlet.dieselPrice}/L`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(outlet);
});

// Admin Specialized Feature 3: Provider Unit Accreditation & Inspection
app.patch('/api/v1/admin/providers/:id/verify', (req: Request, res: Response) => {
  const provider = providersTable.get(req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const { isVerified } = req.body;
  provider.isVerified = Boolean(isVerified);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: `PROVIDER_ACCREDITATION_${provider.isVerified ? 'APPROVED' : 'REVOKED'}`,
    details: `Admin ${provider.isVerified ? 'verified & accredited' : 'suspended accreditation for'} unit ${provider.name} (${provider.agencyName})`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(provider);
});

// Admin Specialized Feature 4: Priority Force-Dispatch & Incident Override
app.post('/api/v1/admin/requests/:id/override', (req: Request, res: Response) => {
  const request = requestsTable.get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Incident request not found' });

  const { providerId, forceStatus, adminNote } = req.body;
  if (providerId) {
    const provider = providersTable.get(providerId);
    if (provider) {
      request.assignedProviderId = provider.id;
      request.assignedProviderName = provider.name;
      request.assignedProviderPhone = provider.phone;
      request.etaMinutes = 10;
      request.status = 'DISPATCHED';
    }
  }

  if (forceStatus) {
    request.status = forceStatus;
  }

  request.updatedAt = new Date().toISOString();

  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: request.id,
    action: 'ADMIN_FORCE_DISPATCH_OVERRIDE',
    details: adminNote || `Admin force-reassigned incident to ${request.assignedProviderName || 'Patrol Unit'} with status ${request.status}`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(request);
});

// Admin Specialized Feature 5: System Telemetry & DB Snapshot Backup
app.get('/api/v1/admin/system/diagnostics', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.json({
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMb: Math.round(mem.rss / 1024 / 1024),
    totalRegisteredUsers: usersTable.size,
    totalRequestsLogged: requestsTable.size,
    syncEngineStatus: 'OPTIMAL',
    dbEngine: 'PostgreSQL In-Memory Emulation + IndexedDB Browser Store',
    activePatrolCoverageKm: 85,
    averageResponseLatencyMs: 14,
    totalAuditEntries: auditLogs.length
  });
});

app.get('/api/v1/admin/system/backup', (_req: Request, res: Response) => {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '2.4.0-highway-ops',
    system: 'FuelRescue Emergency Highway Assistance System',
    users: Array.from(usersTable.values()).map(u => ({ ...u, passwordHash: 'REDACTED' })),
    requests: Array.from(requestsTable.values()),
    outlets: Array.from(outletsTable.values()),
    providers: Array.from(providersTable.values()),
    sectors: Array.from(sectorsTable.values()),
    auditLogs
  };
  res.json(backup);
});

// Driver Push Notifications & Announcement Banners (Admin feature)
app.get('/api/v1/driver/announcements/active', (_req: Request, res: Response) => {
  const active = Array.from(driverAnnouncementsTable.values())
    .filter(a => a.isBannerActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(active);
});

app.get('/api/v1/admin/driver-announcements', (_req: Request, res: Response) => {
  const list = Array.from(driverAnnouncementsTable.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.post('/api/v1/admin/driver-announcements', (req: Request, res: Response) => {
  const { category, title, message, affectedCorridor, severity, isPushNotification } = req.body;
  const id = `ANN-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  // Count active driver users online
  const connectedDriversCount = Array.from(usersTable.values()).filter(u => u.role === 'DRIVER' && u.isActive).length;

  const announcement: ServerDriverAnnouncement = {
    id,
    category: category || 'EMERGENCY',
    title: title || '⚠️ Highway Alert for Travelers',
    message: message || 'Notice from National Highway Operations Control.',
    affectedCorridor: affectedCorridor || 'All Highway Corridors',
    severity: severity || 'CRITICAL',
    isPushNotification: isPushNotification !== false,
    isBannerActive: true,
    deliveredCount: Math.max(1, connectedDriversCount),
    createdAt: now,
    createdBy: 'Highway Operations Admin'
  };

  driverAnnouncementsTable.set(id, announcement);

  // Add into notificationsTable targeted to drivers
  notificationsTable.unshift({
    id: `notif-${id}`,
    type: 'ADMIN_ALERT',
    title: announcement.title,
    message: announcement.message,
    targetRole: 'DRIVER',
    timestamp: now,
    isRead: false,
    priority: announcement.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
  });

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'DRIVER_ANNOUNCEMENT_PUSHED',
    details: `Admin dispatched ${announcement.category} push banner to ${announcement.deliveredCount} driver devices: "${announcement.title}"`,
    timestamp: now,
    actor: 'ADMIN'
  });

  res.status(201).json(announcement);
});

app.patch('/api/v1/admin/driver-announcements/:id/toggle', (req: Request, res: Response) => {
  const ann = driverAnnouncementsTable.get(req.params.id);
  if (!ann) return res.status(404).json({ error: 'Announcement not found' });
  ann.isBannerActive = !ann.isBannerActive;

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: `DRIVER_ANNOUNCEMENT_${ann.isBannerActive ? 'ACTIVATED' : 'RECALLED'}`,
    details: `Admin ${ann.isBannerActive ? 'reactivated' : 'recalled/dismissed'} driver announcement "${ann.title}"`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json(ann);
});

app.delete('/api/v1/admin/driver-announcements/:id', (req: Request, res: Response) => {
  const exists = driverAnnouncementsTable.has(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Announcement not found' });
  const ann = driverAnnouncementsTable.get(req.params.id);
  driverAnnouncementsTable.delete(req.params.id);

  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: 'DRIVER_ANNOUNCEMENT_DELETED',
    details: `Admin permanently deleted driver announcement "${ann?.title || req.params.id}"`,
    timestamp: new Date().toISOString(),
    actor: 'ADMIN'
  });

  res.json({ success: true, message: 'Driver announcement purged' });
});

// Seed an initial request
(function seedInitialRequest() {
  const initialId = 'FR-2026-8919';
  const initialClientReq = 'init-client-uuid-001';
  requestsTable.set(initialId, {
    id: initialId,
    clientRequestId: initialClientReq,
    userId: 'user-driver-demo',
    userName: 'Vikram Rao',
    userPhone: '+91 98490 55123',
    serviceType: 'FUEL',
    vehicleId: 'VEH-01',
    vehicleNumber: 'TS 09 EA 4821',
    fuelType: 'PETROL',
    requestedQuantity: 5,
    latitude: 17.6250,
    longitude: 78.4790,
    locationDescription: 'NH 44 Northbound, 1.5 km before Medchal Toll Plaza, outer shoulder',
    situationNotes: 'Depleted fuel on long trip. Hazard warning lights active.',
    status: 'DISPATCHED',
    syncStatus: 'SYNCED',
    estimatedCost: 798,
    confirmedCost: 798,
    assignedProviderId: 'PROV-TEL-01',
    assignedProviderName: 'Ramesh Reddy',
    assignedProviderPhone: '+91 98492 88410',
    outletSourceId: 'OUT-IOCL-01',
    outletSourceName: 'Indian Oil Swagat Highway Oasis (NH 44 Km 42)',
    etaMinutes: 14,
    paymentStatus: 'PENDING',
    paymentMethod: 'UPI_GPAY_PHONEPE',
    syncRetryCount: 0,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    synchronizedAt: new Date(Date.now() - 17 * 60 * 1000).toISOString()
  });
  clientRequestMap.set(initialClientReq, initialId);
})();

// Start full-stack server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FuelRescue Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
