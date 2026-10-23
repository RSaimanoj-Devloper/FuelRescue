import Dexie, { Table } from 'dexie';
import { AssistanceRequest, Vehicle, FuelOutlet, AssistanceProvider, SyncAuditLog, InAppNotification } from '../types';

export class FuelRescueDatabase extends Dexie {
  requests!: Table<AssistanceRequest, string>;
  vehicles!: Table<Vehicle, string>;
  outlets!: Table<FuelOutlet, string>;
  providers!: Table<AssistanceProvider, string>;
  syncLogs!: Table<SyncAuditLog, string>;
  notifications!: Table<InAppNotification, string>;

  constructor() {
    super('FuelRescueDB');
    this.version(1).stores({
      requests: 'clientRequestId, id, userId, status, syncStatus, createdAt',
      vehicles: 'id, userId, vehicleNumber',
      outlets: 'id, name, highway',
      providers: 'id, userId, status, isVerified',
      syncLogs: 'id, clientRequestId, timestamp, eventType',
      notifications: 'id, userId, read, timestamp'
    });
  }
}

export const db = new FuelRescueDatabase();

// Initial seed data for offline caching (National Highway 44 & 65 corridor around Hyderabad/Telangana)
export const SEED_OUTLETS: FuelOutlet[] = [
  {
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
    hasEmergencyCans: true,
    distanceKm: 4.2
  },
  {
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
    hasEmergencyCans: true,
    distanceKm: 8.5
  },
  {
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
    hasEmergencyCans: true,
    distanceKm: 6.1
  },
  {
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
    hasEmergencyCans: true,
    distanceKm: 12.4
  }
];

export const SEED_PROVIDERS: AssistanceProvider[] = [
  {
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
    completedJobs: 142,
    currentDistanceKm: 3.8
  },
  {
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
    completedJobs: 89,
    currentDistanceKm: 7.2
  },
  {
    id: 'PROV-TEL-03',
    userId: 'user-prov-3',
    name: 'Suresh Varma',
    agencyName: 'Telangana QuickAid Roadside Services',
    phone: '+91 94411 77620',
    vehicleType: 'Highway Patrol Motorbike',
    vehicleNumber: 'TS 09 XY 9081',
    serviceTypes: ['MECHANIC', 'FUEL'],
    latitude: 17.2800,
    longitude: 78.8500,
    coverageRadiusKm: 20,
    status: 'AVAILABLE',
    isVerified: true,
    supportedFuel: ['PETROL'],
    rating: 4.7,
    completedJobs: 54,
    currentDistanceKm: 9.1
  }
];

// Seed initial database tables if empty
export async function initializeDatabase() {
  try {
    const outletCount = await db.outlets.count();
    if (outletCount === 0) {
      await db.outlets.bulkAdd(SEED_OUTLETS);
    }

    const providerCount = await db.providers.count();
    if (providerCount === 0) {
      await db.providers.bulkAdd(SEED_PROVIDERS);
    }

    // Default vehicle for initial user
    const vehicleCount = await db.vehicles.count();
    if (vehicleCount === 0) {
      await db.vehicles.add({
        id: 'VEH-01',
        userId: 'user-driver-demo',
        vehicleNumber: 'TS 09 EA 4821',
        makeModel: 'Hyundai Creta 1.5 SX',
        fuelType: 'PETROL',
        tankCapacityLiters: 50,
        qrCodeToken: 'FR-VEH-TS09EA4821-SIG78A',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn('Database initialization note:', error);
  }
}
