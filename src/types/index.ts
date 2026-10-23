// FuelRescue System Type Definitions

export type UserRole = 'DRIVER' | 'PROVIDER' | 'OUTLET' | 'ADMIN';

export type ServiceType = 'FUEL' | 'TOW_TRUCK' | 'MECHANIC';

export type FuelType = 'PETROL' | 'DIESEL';

export type RequestLifecycleStatus =
  | 'PENDING_SYNC'
  | 'SYNCED'
  | 'MATCHING'
  | 'PROVIDER_ACCEPTED'
  | 'DISPATCHED'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'SYNC_FAILED';

export type SyncState = 'SAVED_OFFLINE' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'SIMULATED_SUCCESS' | 'CASH_ON_DELIVERY';

export type PaymentMethod = 'UPI_GPAY_PHONEPE' | 'DEBIT_CREDIT_CARD' | 'CASH_ON_DELIVERY';

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  isOnline?: boolean;
  activeStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  token?: string;
  createdAt: string;
  lastActive?: string;
  totalRequests?: number;
  totalSpent?: number;
  currentLat?: number;
  currentLon?: number;
  locationName?: string;
  assignedVehicle?: string;
  notes?: string;
}

export interface AppNotification {
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

export interface Vehicle {
  id: string;
  userId: string;
  vehicleNumber: string;
  makeModel: string;
  fuelType: FuelType;
  tankCapacityLiters: number;
  qrCodeToken: string;
  createdAt: string;
}

export interface FuelOutlet {
  id: string;
  name: string;
  omc: 'IOCL' | 'BPCL' | 'HPCL' | 'SHELL' | 'JIO_BP';
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
  distanceKm?: number;
}

export interface AssistanceProvider {
  id: string;
  userId: string;
  name: string;
  agencyName: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  serviceTypes: ServiceType[];
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  isVerified: boolean;
  supportedFuel: FuelType[];
  rating: number;
  completedJobs: number;
  currentDistanceKm?: number;
}

export interface AssistanceRequest {
  id: string; // Server ID (e.g., FR-2026-8910) or client UUID if not yet assigned
  clientRequestId: string; // Unique UUID generated on device
  userId: string;
  userName: string;
  userPhone: string;
  serviceType: ServiceType; // FUEL, TOW_TRUCK, MECHANIC
  towRequirement?: 'FLATBED' | 'WHEEL_LIFT' | 'ACCIDENT_RECOVERY';
  mechanicIssue?: 'BATTERY_JUMPSTART' | 'TYRE_PUNCTURE' | 'ENGINE_OVERHEAT' | 'ELECTRICAL_BRAKE';
  vehicleId?: string;
  vehicleNumber: string;
  fuelType?: FuelType;
  requestedQuantity?: number; // Litres (for fuel service)
  latitude: number;
  longitude: number;
  locationDescription: string;
  situationNotes?: string;
  status: RequestLifecycleStatus;
  syncStatus: SyncState;
  estimatedCost: number;
  confirmedCost?: number;
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderPhone?: string;
  outletSourceId?: string;
  outletSourceName?: string;
  etaMinutes?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  syncRetryCount: number;
  lastSyncAttempt?: string;
  lastSyncError?: string;
  isSosEmergency?: boolean;
  createdAt: string;
  updatedAt: string;
  synchronizedAt?: string;
}

export interface RequestStatusHistory {
  id: string;
  requestId: string;
  status: RequestLifecycleStatus;
  note: string;
  timestamp: string;
  actorRole: UserRole | 'SYSTEM';
}

export interface SyncAuditLog {
  id: string;
  clientRequestId?: string;
  eventType: 'OFFLINE_SAVED' | 'SYNC_TRIGGERED' | 'SYNC_SUCCESS' | 'SYNC_ERROR' | 'IDEMPOTENT_HIT' | 'USER_ACTION';
  message: string;
  timestamp: string;
  success?: boolean;
  action?: string;
  details?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'SYNC' | 'DISPATCH' | 'ARRIVAL' | 'DELIVERY' | 'SAFETY' | 'PAYMENT' | 'SOS';
  requestId?: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsersNow: number;
  activeRequests: number;
  pendingSyncCount: number;
  completedRequests: number;
  cancelledRequests: number;
  registeredProviders: number;
  verifiedProviders: number;
  registeredOutlets: number;
  failedSyncRecords: number;
  averageResponseMinutes: number;
  totalFuelDeliveredLiters: number;
  towJobsCompleted: number;
  mechanicRepairsCompleted: number;
}

export interface GnssLocationData {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitudeMeters?: number | null;
  heading?: number | null;
  speedKmh?: number | null;
  isDirectSatellite: boolean;
  timestamp: number;
  highwayCorridor?: string;
}

export interface HighwaySectorRestriction {
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

export interface SystemDiagnostics {
  uptimeSeconds: number;
  memoryUsageMb: number;
  totalRegisteredUsers: number;
  totalRequestsLogged: number;
  syncEngineStatus: string;
  dbEngine: string;
  activePatrolCoverageKm: number;
  averageResponseLatencyMs: number;
  totalAuditEntries: number;
}

export interface DriverAnnouncement {
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


