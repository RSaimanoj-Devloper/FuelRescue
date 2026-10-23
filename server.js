import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
const usersTable = /* @__PURE__ */ new Map([
  ["user-admin", {
    id: "user-admin",
    name: "Telangana Highway Operations (Admin)",
    email: "admin@fuelrescue.in",
    passwordHash: "Admin@123",
    phone: "+91 94400 11000",
    role: "ADMIN",
    isActive: true,
    createdAt: "2025-11-01T00:00:00Z",
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 0,
    totalSpent: 0,
    currentLat: 17.4399,
    currentLon: 78.4983,
    locationName: "Secunderabad Highway Control Center",
    assignedVehicle: "TS 09 HQ 0001"
  }],
  ["user-driver-demo", {
    id: "user-driver-demo",
    name: "Vikram Rao",
    email: "driver@fuelrescue.in",
    passwordHash: "Driver@123",
    phone: "+91 98490 55123",
    role: "DRIVER",
    isActive: true,
    createdAt: "2026-01-15T08:30:00Z",
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 4,
    totalSpent: 3192,
    currentLat: 17.625,
    currentLon: 78.479,
    locationName: "NH 44 Northbound, near Medchal Toll Plaza",
    assignedVehicle: "TS 09 EA 4821",
    notes: "Frequent commuter on Hyderabad - Nagpur expressway."
  }],
  ["user-driver-2", {
    id: "user-driver-2",
    name: "Priyanka Sharma",
    email: "priyanka.s@gmail.com",
    passwordHash: "Driver@123",
    phone: "+91 99880 77123",
    role: "DRIVER",
    isActive: true,
    createdAt: "2026-02-10T11:20:00Z",
    lastActive: new Date(Date.now() - 12 * 60 * 1e3).toISOString(),
    totalRequests: 2,
    totalSpent: 1850,
    currentLat: 17.2514,
    currentLon: 78.9023,
    locationName: "NH 65 Choutuppal Corridor",
    assignedVehicle: "TS 07 HK 9012"
  }],
  ["user-driver-3", {
    id: "user-driver-3",
    name: "Anand Kumar",
    email: "anand.k@transports.in",
    passwordHash: "Driver@123",
    phone: "+91 94411 22334",
    role: "DRIVER",
    isActive: true,
    createdAt: "2026-03-01T14:10:00Z",
    lastActive: new Date(Date.now() - 35 * 60 * 1e3).toISOString(),
    totalRequests: 1,
    totalSpent: 1450,
    currentLat: 17.2403,
    currentLon: 78.4294,
    locationName: "Nehru Outer Ring Road (ORR Exit 6)",
    assignedVehicle: "TS 08 AB 1234"
  }],
  ["user-prov-1", {
    id: "user-prov-1",
    name: "Ramesh Reddy",
    email: "provider@fuelrescue.in",
    passwordHash: "Patrol@123",
    phone: "+91 98492 88410",
    role: "PROVIDER",
    isActive: true,
    createdAt: "2025-12-01T09:00:00Z",
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 142,
    totalSpent: 0,
    currentLat: 17.615,
    currentLon: 78.475,
    locationName: "NH 44 Rapid Highway Patrol Unit #4",
    assignedVehicle: "TS 08 HG 1102"
  }],
  ["user-outlet-1", {
    id: "user-outlet-1",
    name: "IOCL Highway Oasis Manager",
    email: "outlet@fuelrescue.in",
    passwordHash: "Outlet@123",
    phone: "+91 98490 12345",
    role: "OUTLET",
    isActive: true,
    createdAt: "2025-12-15T09:00:00Z",
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 88,
    totalSpent: 0,
    currentLat: 17.6289,
    currentLon: 78.4812,
    locationName: "Indian Oil Swagat Oasis (NH 44 Km 42)",
    assignedVehicle: "TS 08 BUNK 01"
  }]
]);
const requestsTable = /* @__PURE__ */ new Map();
const clientRequestMap = /* @__PURE__ */ new Map();
const auditLogs = [];
const notificationsTable = [
  {
    id: "notif-init-1",
    type: "SOS_EMERGENCY",
    title: "\u{1F6A8} HIGHWAY PATROL STANDBY ACTIVE",
    message: "Rapid response patrol units #1, #2, #3 active on NH 44 and NH 65 sectors.",
    targetRole: "ALL",
    timestamp: new Date(Date.now() - 20 * 60 * 1e3).toISOString(),
    isRead: false,
    priority: "HIGH"
  }
];
const providersTable = /* @__PURE__ */ new Map([
  ["PROV-TEL-01", {
    id: "PROV-TEL-01",
    userId: "user-prov-1",
    name: "Ramesh Reddy",
    agencyName: "NH 44 Rapid Highway Rescue Unit #4",
    phone: "+91 98492 88410",
    vehicleType: "Rescue Patrol Bike with Twin Approved Safety Jerrycans (20L)",
    vehicleNumber: "TS 08 HG 1102",
    serviceTypes: ["FUEL", "MECHANIC"],
    latitude: 17.615,
    longitude: 78.475,
    coverageRadiusKm: 25,
    status: "AVAILABLE",
    isVerified: true,
    supportedFuel: ["PETROL", "DIESEL"],
    rating: 4.9,
    completedJobs: 142
  }],
  ["PROV-TEL-02", {
    id: "PROV-TEL-02",
    userId: "user-prov-2",
    name: "Mohammed Kareem",
    agencyName: "Cyberabad Highway Heavy Towing & Flatbed Recovery",
    phone: "+91 98480 33211",
    vehicleType: "Hydraulic Flatbed Tow Truck with Wheel-Lift Crane",
    vehicleNumber: "TS 07 UA 4419",
    serviceTypes: ["TOW_TRUCK", "MECHANIC", "FUEL"],
    latitude: 17.26,
    longitude: 78.44,
    coverageRadiusKm: 35,
    status: "AVAILABLE",
    isVerified: true,
    supportedFuel: ["PETROL", "DIESEL"],
    rating: 4.8,
    completedJobs: 89
  }],
  ["PROV-TEL-03", {
    id: "PROV-TEL-03",
    userId: "user-prov-3",
    name: "Suresh Varma",
    agencyName: "Telangana QuickAid Roadside Mechanic & Puncture Express",
    phone: "+91 94411 77620",
    vehicleType: "Mobile Diagnostic Utility Van with Air Compressor & Heavy Jumper",
    vehicleNumber: "TS 09 XY 9081",
    serviceTypes: ["MECHANIC", "FUEL"],
    latitude: 17.28,
    longitude: 78.85,
    coverageRadiusKm: 20,
    status: "AVAILABLE",
    isVerified: true,
    supportedFuel: ["PETROL"],
    rating: 4.7,
    completedJobs: 54
  }]
]);
const outletsTable = /* @__PURE__ */ new Map([
  ["OUT-IOCL-01", {
    id: "OUT-IOCL-01",
    name: "Indian Oil Swagat Highway Oasis",
    omc: "IOCL",
    highway: "NH 44 (Hyderabad - Nagpur)",
    landmark: "Km 42, Gundlapochampally near Medchal Toll Plaza",
    latitude: 17.6289,
    longitude: 78.4812,
    phone: "+91 98490 12345",
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: "24 Hours",
    hasEmergencyCans: true
  }],
  ["OUT-BPCL-02", {
    id: "OUT-BPCL-02",
    name: "Bharat Petroleum Ghar Highway Hub",
    omc: "BPCL",
    highway: "NH 65 (Hyderabad - Vijayawada)",
    landmark: "Km 36, Near Choutuppal bypass, Opposite Reliance Fresh",
    latitude: 17.2514,
    longitude: 78.9023,
    phone: "+91 94401 56789",
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: "24 Hours",
    hasEmergencyCans: true
  }],
  ["OUT-HPCL-03", {
    id: "OUT-HPCL-03",
    name: "HPCL Auto Care Centre - ORR Exit 6",
    omc: "HPCL",
    highway: "Nehru Outer Ring Road (ORR)",
    landmark: "Exit 6, Shamshabad - Airport approach road",
    latitude: 17.2403,
    longitude: 78.4294,
    phone: "+91 99890 24680",
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 109.66,
    dieselPrice: 97.82,
    operatingHours: "24 Hours",
    hasEmergencyCans: true
  }],
  ["OUT-SHELL-04", {
    id: "OUT-SHELL-04",
    name: "Shell Select Express Highway Depot",
    omc: "SHELL",
    highway: "NH 44 (Hyderabad - Bengaluru)",
    landmark: "Km 58, Shadnagar Highway Junction",
    latitude: 17.0682,
    longitude: 78.2091,
    phone: "+91 98480 98765",
    petrolAvailable: true,
    dieselAvailable: true,
    petrolPrice: 112.5,
    dieselPrice: 99.4,
    operatingHours: "06:00 - 23:00",
    hasEmergencyCans: true
  }]
]);
const vehiclesTable = /* @__PURE__ */ new Map([
  ["VEH-01", {
    id: "VEH-01",
    userId: "user-driver-demo",
    vehicleNumber: "TS 09 EA 4821",
    makeModel: "Hyundai Creta 1.5 SX",
    fuelType: "PETROL",
    tankCapacity: 50,
    qrCodeToken: "FR-VEH-TS09EA4821-SIG78A"
  }],
  ["VEH-02", {
    id: "VEH-02",
    userId: "user-driver-demo",
    vehicleNumber: "TS 07 HK 9012",
    makeModel: "Toyota Innova Crysta 2.4 VX",
    fuelType: "DIESEL",
    tankCapacity: 65,
    qrCodeToken: "FR-VEH-TS07HK9012-SIG99B"
  }]
]);
let requestSequence = 8920;
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "UP",
    database: "Aiven-PostgreSQL-Compatible-Emulation",
    version: "1.2.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password, role, name, phone, assignedVehicle, locationName } = req.body;
  const user = Array.from(usersTable.values()).find((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (user) {
    if (password && user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid password. Check credentials." });
    }
    user.lastActive = (/* @__PURE__ */ new Date()).toISOString();
    const token2 = `jwt_${user.role}_${Date.now()}_${Buffer.from(user.email).toString("base64")}`;
    return res.json({ user, token: token2 });
  }
  const targetRole = role || (email?.includes("admin") ? "ADMIN" : email?.includes("provider") ? "PROVIDER" : email?.includes("outlet") ? "OUTLET" : "DRIVER");
  const newId = `user-${Date.now().toString().slice(-4)}`;
  const newUser = {
    id: newId,
    name: name || (email?.split("@")[0] || "Highway User"),
    email: email || `user-${Date.now()}@fuelrescue.in`,
    passwordHash: password || "SecurePass@123",
    phone: phone || "+91 98490 55123",
    role: targetRole,
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 0,
    totalSpent: 0,
    currentLat: 17.625,
    currentLon: 78.479,
    locationName: locationName || "NH 44 Northbound Corridor",
    assignedVehicle: assignedVehicle || "TS 09 NEW 1234"
  };
  usersTable.set(newId, newUser);
  const token = `jwt_${targetRole}_${Date.now()}`;
  res.json({ user: newUser, token });
});
app.get("/api/v1/users", (_req, res) => {
  const now = Date.now();
  const users = Array.from(usersTable.values()).map((u) => {
    const lastActiveTime = new Date(u.lastActive).getTime();
    const isOnline = u.isActive && now - lastActiveTime < 5 * 60 * 1e3;
    return {
      ...u,
      isOnline,
      activeStatus: !u.isActive ? "SUSPENDED" : isOnline ? "ACTIVE" : "INACTIVE"
    };
  });
  res.json(users);
});
app.post("/api/v1/users", (req, res) => {
  const { name, email, phone, role, password, assignedVehicle, locationName } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Name and email are required to register a user" });
  }
  const existing = Array.from(usersTable.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "User with this email already exists in the system" });
  }
  const id = `user-${Date.now().toString().slice(-4)}`;
  const newUser = {
    id,
    name,
    email,
    passwordHash: password || "SecurePass@123",
    phone: phone || "+91 98490 11223",
    role: role || "DRIVER",
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastActive: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequests: 0,
    totalSpent: 0,
    currentLat: 17.4399,
    currentLon: 78.4983,
    locationName: locationName || "Telangana Highway Network",
    assignedVehicle: assignedVehicle || "TS 09 ADM 0001"
  };
  usersTable.set(id, newUser);
  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: "USER_CREATED_BY_ADMIN",
    details: `Admin created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "ADMIN"
  });
  res.status(201).json(newUser);
});
app.post("/api/v1/users/:id/heartbeat", (req, res) => {
  const user = usersTable.get(req.params.id);
  if (user) {
    user.lastActive = (/* @__PURE__ */ new Date()).toISOString();
  }
  res.json({ success: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/v1/users/:id", (req, res) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const now = Date.now();
  const isOnline = user.isActive && now - new Date(user.lastActive).getTime() < 5 * 60 * 1e3;
  res.json({
    ...user,
    isOnline,
    activeStatus: !user.isActive ? "SUSPENDED" : isOnline ? "ACTIVE" : "INACTIVE"
  });
});
app.patch("/api/v1/users/:id/status", (req, res) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { isActive } = req.body;
  user.isActive = Boolean(isActive);
  user.lastActive = (/* @__PURE__ */ new Date()).toISOString();
  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: `USER_${user.isActive ? "ACTIVATED" : "SUSPENDED"}`,
    details: `Admin changed status for user ${user.name} (${user.email}) to ${user.isActive ? "ACTIVE" : "SUSPENDED"}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "ADMIN"
  });
  res.json(user);
});
app.patch("/api/v1/users/:id", (req, res) => {
  const user = usersTable.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { role, notes, name, phone, assignedVehicle, locationName } = req.body;
  if (role) user.role = role;
  if (notes !== void 0) user.notes = notes;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (assignedVehicle) user.assignedVehicle = assignedVehicle;
  if (locationName) user.locationName = locationName;
  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: "USER_PROFILE_UPDATED",
    details: `Admin updated user profile ${user.name} (${user.id})`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "ADMIN"
  });
  res.json(user);
});
app.delete("/api/v1/users/:id", (req, res) => {
  const exists = usersTable.has(req.params.id);
  if (!exists) return res.status(404).json({ error: "User not found" });
  usersTable.delete(req.params.id);
  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: "USER_DELETED",
    details: `Admin permanently removed user ID ${req.params.id}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "ADMIN"
  });
  res.json({ success: true, message: "User deleted from PostgreSQL database" });
});
app.get("/api/v1/notifications", (req, res) => {
  const { role } = req.query;
  let list = [...notificationsTable];
  if (role) {
    list = list.filter((n) => n.targetRole === "ALL" || n.targetRole === role);
  }
  res.json(list.slice(0, 30));
});
app.patch("/api/v1/notifications/:id/read", (req, res) => {
  const notif = notificationsTable.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});
app.post("/api/v1/sos/broadcast", (req, res) => {
  const { vehicleNumber, locationDescription, latitude, longitude, serviceType, userPhone, userName } = req.body;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const alertId = `sos-${Date.now()}`;
  const notif = {
    id: alertId,
    type: "SOS_EMERGENCY",
    title: `\u{1F6A8} CRITICAL SOS: ${vehicleNumber || "Vehicle"} Stranded!`,
    message: `Immediate dispatch needed for ${userName || "Traveler"} (${userPhone || "Emergency contact"}) at ${locationDescription || "Highway Shoulder"}. Service: ${serviceType || "Roadside Assistance"}.`,
    targetRole: "ALL",
    location: {
      lat: Number(latitude) || 17.625,
      lon: Number(longitude) || 78.479,
      description: locationDescription || "NH 44 Highway Outer Shoulder"
    },
    vehicleNumber,
    userPhone,
    timestamp: now,
    isRead: false,
    priority: "CRITICAL"
  };
  notificationsTable.unshift(notif);
  auditLogs.push({
    id: `aud-${Date.now()}`,
    action: "SOS_BROADCAST_TRANSMITTED",
    details: `High Priority SOS broadcast transmitted to ALL service providers and Admin for vehicle ${vehicleNumber}`,
    timestamp: now,
    actor: "ONE_TAP_SOS_SYSTEM"
  });
  res.status(201).json({
    success: true,
    notification: notif,
    alertTransmittedToProviders: providersTable.size,
    alertTransmittedToAdmin: true
  });
});
app.get("/api/v1/vehicles", (_req, res) => {
  res.json(Array.from(vehiclesTable.values()));
});
app.post("/api/v1/vehicles", (req, res) => {
  const { vehicleNumber, makeModel, fuelType, tankCapacity } = req.body;
  if (!vehicleNumber) {
    return res.status(400).json({ error: "Vehicle number is required" });
  }
  const id = `VEH-0${vehiclesTable.size + 1}`;
  const qrCodeToken = `FR-VEH-${vehicleNumber.replace(/\s+/g, "")}-SIG${Math.floor(1e3 + Math.random() * 9e3)}`;
  const vehicle = {
    id,
    userId: "user-driver-demo",
    vehicleNumber,
    makeModel: makeModel || "Passenger Vehicle",
    fuelType: fuelType || "PETROL",
    tankCapacity: Number(tankCapacity) || 45,
    qrCodeToken
  };
  vehiclesTable.set(id, vehicle);
  res.status(201).json(vehicle);
});
app.get("/api/v1/vehicles/qr/:token", (req, res) => {
  const { token } = req.params;
  const vehicle = Array.from(vehiclesTable.values()).find((v) => v.qrCodeToken === token);
  if (!vehicle) {
    return res.status(404).json({ error: "Valid vehicle record not found for this emergency QR reference" });
  }
  res.json({
    verified: true,
    vehicleNumber: vehicle.vehicleNumber,
    makeModel: vehicle.makeModel,
    approvedFuelType: vehicle.fuelType,
    tankCapacityLiters: vehicle.tankCapacity,
    emergencySafetyCleared: true,
    verificationTimestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/v1/outlets", (_req, res) => {
  res.json(Array.from(outletsTable.values()));
});
app.get("/api/v1/providers", (_req, res) => {
  res.json(Array.from(providersTable.values()));
});
app.patch("/api/v1/providers/:id/availability", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const provider = providersTable.get(id);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }
  provider.status = status;
  res.json(provider);
});
app.post("/api/v1/requests/sync", (req, res) => {
  const body = req.body;
  const clientRequestId = body.clientRequestId || req.headers["x-client-request-id"];
  if (!clientRequestId) {
    return res.status(400).json({ error: "Missing mandatory clientRequestId for synchronization" });
  }
  if (clientRequestMap.has(clientRequestId)) {
    const existingId = clientRequestMap.get(clientRequestId);
    const existing = requestsTable.get(existingId);
    if (existing) {
      auditLogs.push({
        id: `aud-${Date.now()}`,
        clientRequestId,
        requestId: existing.id,
        action: "IDEMPOTENT_HIT",
        details: `Subsequent sync request received for ${clientRequestId}. Returned existing server ID ${existing.id}.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        actor: "SYSTEM_SYNC_CONTROLLER"
      });
      return res.status(200).json(existing);
    }
  }
  const serviceType = body.serviceType || "FUEL";
  const userLat = Number(body.latitude) || 17.625;
  const userLon = Number(body.longitude) || 78.479;
  const eligibleProviders = Array.from(providersTable.values()).filter((p) => {
    if (p.status !== "AVAILABLE") return false;
    return p.serviceTypes.includes(serviceType);
  });
  let bestProvider;
  let minDistance = Infinity;
  eligibleProviders.forEach((p) => {
    const dist = calculateDistance(userLat, userLon, p.latitude, p.longitude);
    if (dist <= p.coverageRadiusKm && dist < minDistance) {
      minDistance = dist;
      bestProvider = p;
    }
  });
  let totalCost = 0;
  if (serviceType === "FUEL") {
    const quantity = Number(body.requestedQuantity) || 5;
    const fuelRate = body.fuelType === "DIESEL" ? 97.82 : 109.66;
    totalCost = Math.round(fuelRate * quantity) + 250;
  } else if (serviceType === "TOW_TRUCK") {
    totalCost = 1450;
  } else if (serviceType === "MECHANIC") {
    totalCost = 650;
  }
  requestSequence += 1;
  const serverId = `FR-2026-${requestSequence}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newRequest = {
    id: serverId,
    clientRequestId,
    userId: body.userId || "user-driver-demo",
    userName: body.userName || "Highway Traveler",
    userPhone: body.userPhone || "+91 98490 55123",
    serviceType,
    towRequirement: body.towRequirement,
    mechanicIssue: body.mechanicIssue,
    vehicleId: body.vehicleId || "VEH-01",
    vehicleNumber: body.vehicleNumber || "TS 09 EA 4821",
    fuelType: body.fuelType,
    requestedQuantity: body.requestedQuantity,
    latitude: userLat,
    longitude: userLon,
    locationDescription: body.locationDescription || "NH 44 Highway Shoulder",
    situationNotes: body.situationNotes,
    status: bestProvider ? "MATCHING" : "PENDING_SYNC",
    syncStatus: "SYNCED",
    estimatedCost: totalCost,
    assignedProviderId: bestProvider?.id,
    assignedProviderName: bestProvider?.name,
    assignedProviderPhone: bestProvider?.phone,
    outletSourceId: serviceType === "FUEL" ? "OUT-IOCL-01" : void 0,
    outletSourceName: serviceType === "FUEL" ? "Indian Oil Swagat Highway Oasis (NH 44 Km 42)" : void 0,
    etaMinutes: bestProvider ? Math.max(12, Math.round(minDistance * 2.8)) : 18,
    paymentStatus: "PENDING",
    syncRetryCount: 0,
    isSosEmergency: body.isSosEmergency || false,
    createdAt: body.createdAt || now,
    updatedAt: now,
    synchronizedAt: now
  };
  requestsTable.set(serverId, newRequest);
  clientRequestMap.set(clientRequestId, serverId);
  const driverUser = usersTable.get(newRequest.userId);
  if (driverUser) {
    driverUser.totalRequests = (driverUser.totalRequests || 0) + 1;
    driverUser.lastActive = now;
    driverUser.currentLat = userLat;
    driverUser.currentLon = userLon;
  }
  auditLogs.push({
    id: `aud-${Date.now()}`,
    clientRequestId,
    requestId: serverId,
    action: `REQUEST_${serviceType}_SYNCHRONIZED`,
    details: `Created emergency ${serviceType} assistance request for ${newRequest.vehicleNumber}. Assigned provider: ${bestProvider?.name || "Searching..."}`,
    timestamp: now,
    actor: "SYSTEM_DISPATCH_ENGINE"
  });
  res.status(201).json(newRequest);
});
app.get("/api/v1/requests", (req, res) => {
  const { userId, providerId, status, serviceType } = req.query;
  let list = Array.from(requestsTable.values());
  if (userId) list = list.filter((r) => r.userId === userId);
  if (providerId) list = list.filter((r) => r.assignedProviderId === providerId);
  if (status) list = list.filter((r) => r.status === status);
  if (serviceType) list = list.filter((r) => r.serviceType === serviceType);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});
app.get("/api/v1/requests/:id", (req, res) => {
  const request = requestsTable.get(req.params.id);
  if (!request) return res.status(404).json({ error: "Assistance request not found" });
  res.json(request);
});
app.patch("/api/v1/requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, note, actorRole = "PROVIDER" } = req.body;
  const request = requestsTable.get(id);
  if (!request) return res.status(404).json({ error: "Assistance request not found" });
  request.status = status;
  request.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (status === "DELIVERED") request.confirmedCost = request.estimatedCost;
  if (status === "COMPLETED") request.paymentStatus = "CONFIRMED";
  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: id,
    action: `STATUS_CHANGE_TO_${status}`,
    details: note || `Status updated to ${status} by ${actorRole}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: actorRole
  });
  res.json(request);
});
app.post("/api/v1/requests/:id/accept", (req, res) => {
  const { id } = req.params;
  const { providerId } = req.body;
  const request = requestsTable.get(id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "MATCHING" && request.status !== "SYNCED") {
    return res.status(409).json({ error: `Request already claimed (${request.status}).` });
  }
  const provider = providersTable.get(providerId || "PROV-TEL-01");
  if (provider) {
    request.assignedProviderId = provider.id;
    request.assignedProviderName = provider.name;
    request.assignedProviderPhone = provider.phone;
    request.etaMinutes = 16;
  }
  request.status = "PROVIDER_ACCEPTED";
  request.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId: id,
    action: "PROVIDER_CLAIMED_REQUEST",
    details: `Claimed by provider ${request.assignedProviderName}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "PROVIDER"
  });
  res.json(request);
});
app.post("/api/v1/transactions/simulate-payment", (req, res) => {
  const { requestId, method = "UPI_GPAY_PHONEPE" } = req.body;
  const request = requestsTable.get(requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });
  const transactionRef = `TXN-IND-${Date.now()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
  request.paymentStatus = "SIMULATED_SUCCESS";
  request.paymentMethod = method;
  request.transactionReference = transactionRef;
  request.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  auditLogs.push({
    id: `aud-${Date.now()}`,
    requestId,
    action: "PAYMENT_SIMULATED",
    details: `Sandbox payment completed for \u20B9${request.estimatedCost}. Ref: ${transactionRef}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    actor: "PAYMENT_GATEWAY_SANDBOX"
  });
  res.json({
    success: true,
    message: "Sandbox Simulated Payment Confirmed (Test Environment)",
    transactionReference: transactionRef,
    amount: request.estimatedCost,
    request
  });
});
app.get("/api/v1/admin/metrics", (_req, res) => {
  const requests = Array.from(requestsTable.values());
  const activeCount = requests.filter((r) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;
  const cancelledCount = requests.filter((r) => r.status === "CANCELLED" || r.status === "REJECTED").length;
  const totalLiters = requests.filter((r) => (r.status === "COMPLETED" || r.status === "DELIVERED") && r.serviceType === "FUEL").reduce((acc, curr) => acc + (curr.requestedQuantity || 0), 0);
  const now = Date.now();
  const activeUsersCount = Array.from(usersTable.values()).filter(
    (u) => u.isActive && now - new Date(u.lastActive).getTime() < 5 * 60 * 1e3
  ).length;
  res.json({
    totalUsers: usersTable.size,
    activeUsersNow: activeUsersCount,
    activeRequests: activeCount,
    pendingSyncCount: 0,
    completedRequests: completedCount,
    cancelledRequests: cancelledCount,
    registeredProviders: providersTable.size,
    verifiedProviders: Array.from(providersTable.values()).filter((p) => p.isVerified).length,
    registeredOutlets: outletsTable.size,
    failedSyncRecords: 0,
    averageResponseMinutes: 16.4,
    totalFuelDeliveredLiters: totalLiters + 420,
    towJobsCompleted: 34,
    mechanicRepairsCompleted: 58
  });
});
app.get("/api/v1/admin/logs", (_req, res) => {
  res.json(auditLogs.slice(-60).reverse());
});
(function seedInitialRequest() {
  const initialId = "FR-2026-8919";
  const initialClientReq = "init-client-uuid-001";
  requestsTable.set(initialId, {
    id: initialId,
    clientRequestId: initialClientReq,
    userId: "user-driver-demo",
    userName: "Vikram Rao",
    userPhone: "+91 98490 55123",
    serviceType: "FUEL",
    vehicleId: "VEH-01",
    vehicleNumber: "TS 09 EA 4821",
    fuelType: "PETROL",
    requestedQuantity: 5,
    latitude: 17.625,
    longitude: 78.479,
    locationDescription: "NH 44 Northbound, 1.5 km before Medchal Toll Plaza, outer shoulder",
    situationNotes: "Depleted fuel on long trip. Hazard warning lights active.",
    status: "DISPATCHED",
    syncStatus: "SYNCED",
    estimatedCost: 798,
    confirmedCost: 798,
    assignedProviderId: "PROV-TEL-01",
    assignedProviderName: "Ramesh Reddy",
    assignedProviderPhone: "+91 98492 88410",
    outletSourceId: "OUT-IOCL-01",
    outletSourceName: "Indian Oil Swagat Highway Oasis (NH 44 Km 42)",
    etaMinutes: 14,
    paymentStatus: "PENDING",
    paymentMethod: "UPI_GPAY_PHONEPE",
    syncRetryCount: 0,
    createdAt: new Date(Date.now() - 18 * 60 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1e3).toISOString(),
    synchronizedAt: new Date(Date.now() - 17 * 60 * 1e3).toISOString()
  });
  clientRequestMap.set(initialClientReq, initialId);
})();
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FuelRescue Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
