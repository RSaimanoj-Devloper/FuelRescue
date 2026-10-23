import { LanguageCode } from '../types';

export interface Translations {
  appName: string;
  emergencyTag: string;
  requestFuel: string;
  requestTowing: string;
  requestMechanic: string;
  oneTapSos: string;
  sosAlert: string;
  driverHub: string;
  tracker: string;
  providerDispatch: string;
  fuelOutlets: string;
  adminMetrics: string;
  pseResearch: string;
  strandedTitle: string;
  strandedSubtitle: string;
  selectService: string;
  fuelService: string;
  towingService: string;
  mechanicService: string;
  vehicleNumber: string;
  contactPhone: string;
  petrol: string;
  diesel: string;
  quantity: string;
  location: string;
  detectGps: string;
  satelliteGnssDirect: string;
  reviewConfirm: string;
  offlineBannerTitle: string;
  offlineBannerDesc: string;
  syncNow: string;
  activeUsers: string;
  safetyChecklist: string;
  lightMode: string;
  darkMode: string;
  lowBatteryMode: string;
  lowNetworkMode: string;
  logout: string;
  login: string;
  allUsers: string;
  actions: string;
  suspend: string;
  activate: string;
  userDossier: string;
  close: string;
  deleteUser: string;
  confirmDelete: string;
  addUser: string;
  emergencyBroadcast: string;
  broadcastMessage: string;
  sendBroadcast: string;
  exportAuditLogs: string;
  incidentControl: string;
  vehicles: string;
  addVehicle: string;
  providerStatus: string;
  available: string;
  busy: string;
  offline: string;
  acceptRequest: string;
  markEnRoute: string;
  markArrived: string;
  markCompleted: string;
  fuelStations: string;
  emergencyCansStock: string;
  callStation: string;
  directions: string;
  userRole: string;
  noPrivilegeAccess: string;
  adminCommandCenter: string;
  priorityAlerts: string;
  systemAuditLogs: string;
  onlineNow: string;
  inactive: string;
  // Admin-Only Special Operational Features
  corridorSectors: string;
  fuelPricingReg: string;
  fleetAccreditation: string;
  systemHealth: string;
  forceDispatch: string;
  declareRestriction: string;
  downloadBackup: string;
}

export const DICTIONARY: Record<LanguageCode, Translations> = {
  en: {
    appName: 'FuelRescue',
    emergencyTag: 'Highway Emergency Assistance',
    requestFuel: 'Emergency Fuel',
    requestTowing: 'Tow Truck Recovery',
    requestMechanic: 'On-Spot Mechanic',
    oneTapSos: 'ONE-TAP SOS',
    sosAlert: 'Emergency Highway SOS Triggered!',
    driverHub: 'Driver Hub',
    tracker: 'Request Tracker',
    providerDispatch: 'Patrol Dispatch',
    fuelOutlets: 'Fuel Outlets',
    adminMetrics: 'Admin Operations',
    pseResearch: 'PSE Research',
    strandedTitle: 'Stranded on the National Highway?',
    strandedSubtitle: 'Request emergency fuel delivery, tow truck recovery, or on-spot mechanic repair in minutes—even completely offline.',
    selectService: 'Select Emergency Roadside Service',
    fuelService: 'Emergency Fuel (Petrol/Diesel)',
    towingService: 'Tow Truck / Flatbed Recovery',
    mechanicService: 'On-Spot Mechanic & Battery Jump',
    vehicleNumber: 'Vehicle Plate Number',
    contactPhone: 'Driver Contact Phone',
    petrol: 'Petrol (Motor Spirit)',
    diesel: 'High Speed Diesel (HSD)',
    quantity: 'Fuel Quantity',
    location: 'Highway Location & Landmark',
    detectGps: 'Detect Satellite GNSS Location',
    satelliteGnssDirect: 'Smartphone Built-in GNSS (GPS/GLONASS/NavIC) Active',
    reviewConfirm: 'Review & Dispatch Assistance',
    offlineBannerTitle: 'Offline Mode Active — Device Storage Engaged',
    offlineBannerDesc: 'Emergency requests save safely in local IndexedDB without internet and synchronize automatically once network returns.',
    syncNow: 'Sync Now',
    activeUsers: 'Active Highway Users',
    safetyChecklist: 'MoRTH National Highway Roadside Safety Protocol',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    lowBatteryMode: 'Low Battery Mode (OLED Saver)',
    lowNetworkMode: 'Low Data Mode',
    logout: 'Sign Out',
    login: 'Sign In',
    allUsers: 'All Registered Highway Users',
    actions: 'Actions',
    suspend: 'Suspend User',
    activate: 'Activate User',
    userDossier: 'Complete User Dashboard & Dossier',
    close: 'Close',
    deleteUser: 'Delete User',
    confirmDelete: 'Permanently Delete User',
    addUser: 'Add New User',
    emergencyBroadcast: 'Highway Emergency Broadcast',
    broadcastMessage: 'Alert Message Content',
    sendBroadcast: 'Transmit Highway Bulletin',
    exportAuditLogs: 'Export Audit Trail (CSV)',
    incidentControl: 'Incident Dispatch Priority',
    vehicles: 'My Vehicles',
    addVehicle: 'Register Vehicle',
    providerStatus: 'Patrol Availability',
    available: 'Available for Dispatch',
    busy: 'Dispatched / In Mission',
    offline: 'Off Duty',
    acceptRequest: 'Claim & Dispatch Unit',
    markEnRoute: 'Mark En Route',
    markArrived: 'Mark Arrived on Scene',
    markCompleted: 'Mark Job Completed',
    fuelStations: '24/7 Verified Highway Outlets',
    emergencyCansStock: 'Emergency Canisters Stock',
    callStation: 'Call Station',
    directions: 'Navigation & Directions',
    userRole: 'Authorized Role',
    noPrivilegeAccess: 'Access Restricted to Authorized Role Privileges',
    adminCommandCenter: 'National Highway Operations Command',
    priorityAlerts: 'Priority Emergency Alerts',
    systemAuditLogs: 'Tamper-Evident System Audit Logs',
    onlineNow: 'Active Now',
    inactive: 'Inactive',
    corridorSectors: 'Corridor Safety Geofences',
    fuelPricingReg: 'Subsidized Fuel Tariffs',
    fleetAccreditation: 'Patrol Unit Accreditation',
    systemHealth: 'System Diagnostics & Telemetry',
    forceDispatch: 'Force Dispatch',
    declareRestriction: 'Declare Sector Restriction',
    downloadBackup: 'Download System Backup (JSON)'
  },
  te: {
    appName: 'ఫ్యూయల్ రెస్క్యూ',
    emergencyTag: 'జాతీయ రహదారి అత్యవసర సేవ',
    requestFuel: 'అత్యవసర ఇంధనం',
    requestTowing: 'టోయింగ్ సర్వీస్',
    requestMechanic: 'స్పాట్ మెకానిక్',
    oneTapSos: 'ఒక్క ట్యాప్ SOS',
    sosAlert: 'హైవే ఎమర్జెన్సీ SOS పంపబడింది!',
    driverHub: 'డ్రైవర్ హబ్',
    tracker: 'ట్రాకర్',
    providerDispatch: 'రెస్క్యూ పెట్రోల్',
    fuelOutlets: 'పెట్రోల్ బంకులు',
    adminMetrics: 'అడ్మిన్ డాష్‌బోర్డ్',
    pseResearch: 'PSE పరిశోధన',
    strandedTitle: 'జాతీయ రహదారిపై వాహనం ఆగిపోయిందా?',
    strandedSubtitle: 'ఇంధనం, టో ట్రక్ లేదా మెకానిక్ సహాయాన్ని నిమిషాల్లో పొందండి—నెట్‌వర్క్ లేకపోయినా పనిచేస్తుంది.',
    selectService: 'అత్యవసర సేవను ఎంచుకోండి',
    fuelService: 'అత్యవసర ఇంధనం (పెట్రోల్/డీజిల్)',
    towingService: 'టో ట్రక్ / రికవరీ సర్వీస్',
    mechanicService: 'ఆన్-స్పాట్ మెకానిక్ & బ్యాటరీ జంప్',
    vehicleNumber: 'వాహనం నంబర్',
    contactPhone: 'డ్రైవర్ ఫోన్ నంబర్',
    petrol: 'పెట్రోల్',
    diesel: 'డీజిల్',
    quantity: 'ఇంధన పరిమాణం',
    location: 'హైవే లొకేషన్ మరియు ల్యాండ్‌మార్క్',
    detectGps: 'శాటిలైట్ GNSS లొకేషన్ గుర్తించు',
    satelliteGnssDirect: 'ఫోన్ ఇన్-బిల్ట్ శాటిలైట్ GNSS (నెట్ లేకుండా లొకేషన్)',
    reviewConfirm: 'పరిశీలించి నిర్ధారించండి',
    offlineBannerTitle: 'ఆఫ్‌లైన్ మోడ్ — స్థానిక డేటాబేస్ సిద్ధంగా ఉంది',
    offlineBannerDesc: 'నెట్‌వర్క్ లేకపోయినా అభ్యర్థనలు సేవ్ చేయబడతాయి మరియు నెట్ రాగానే సింక్ అవుతాయి.',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    activeUsers: 'యాక్టివ్ యూజర్లు',
    safetyChecklist: 'MoRTH జాతీయ రహదారి భద్రతా నియమాలు',
    lightMode: 'లైట్ మోడ్',
    darkMode: 'డార్క్ మోడ్',
    lowBatteryMode: 'తక్కువ బ్యాటరీ మోడ్',
    lowNetworkMode: 'తక్కువ నెట్‌వర్క్ మోడ్',
    logout: 'లాగ్ అవుట్',
    login: 'లాగిన్',
    allUsers: 'నమోదైన యూజర్లు',
    actions: 'చర్యలు',
    suspend: 'సస్పెండ్ చేయి',
    activate: 'యాక్టివేట్ చేయి',
    userDossier: 'యూజర్ పూర్తి వివరాలు',
    close: 'మూసివేయి',
    deleteUser: 'యూజర్‌ను తొలగించు',
    confirmDelete: 'శాశ్వతంగా తొలగించు',
    addUser: 'కొత్త యూజర్‌ను జోడించు',
    emergencyBroadcast: 'హైవే అత్యవసర సమాచారం',
    broadcastMessage: 'హెచ్చరిక సందేశం',
    sendBroadcast: 'హెచ్చరికను ప్రసారం చేయి',
    exportAuditLogs: 'ఆడిట్ లాగ్స్ ఎగుమతి (CSV)',
    incidentControl: 'ఘటనా ప్రాధాన్యత నియంత్రణ',
    vehicles: 'నా వాహనాలు',
    addVehicle: 'వాహనాన్ని నమోదు చేయి',
    providerStatus: 'పెట్రోల్ లభ్యత',
    available: 'లభ్యతలో ఉంది',
    busy: 'రెస్క్యూ డ్యూటీలో ఉంది',
    offline: 'ఆఫ్‌లైన్',
    acceptRequest: 'వినంతిని స్వీకరించు',
    markEnRoute: 'బయలుదేరిందిగా గుర్తించు',
    markArrived: 'చేరుకున్నట్లు గుర్తించు',
    markCompleted: 'పని పూర్తయింది',
    fuelStations: 'ధృవీకరించబడిన హైవే పెట్రోల్ బంకులు',
    emergencyCansStock: 'అత్యవసర క్యాన్‌ల నిల్వ',
    callStation: 'స్టేషన్‌కు కాల్ చేయండి',
    directions: 'మ్యాప్ దిశలు',
    userRole: 'అధికారిక పాత్ర',
    noPrivilegeAccess: 'మీ పాత్రకు ఈ విభాగానికి అనుమతి లేదు',
    adminCommandCenter: 'హైవే అథారిటీ కమాండ్ సెంటర్',
    priorityAlerts: 'అత్యవసర హెచ్చరికలు',
    systemAuditLogs: 'సిస్టమ్ ఆడిట్ లాగ్స్',
    onlineNow: 'ప్రస్తుతం ఆన్‌లైన్',
    inactive: 'నిష్క్రియ',
    corridorSectors: 'హైవే భద్రతా సెక్టార్లు',
    fuelPricingReg: 'రాయితీ ఇంధన ధరల నియంత్రణ',
    fleetAccreditation: 'పెట్రోల్ యూనిట్ల ధృవీకరణ',
    systemHealth: 'సిస్టమ్ టెలిమెట్రీ & ఆరోగ్యం',
    forceDispatch: 'తక్షణ రవాణా ఆదేశం',
    declareRestriction: 'సెక్టార్ పరిమితిని ప్రకటించు',
    downloadBackup: 'డేటాబేస్ బ్యాకప్ డౌన్‌లోడ్'
  },
  hi: {
    appName: 'फ्यूल रेस्क्यू',
    emergencyTag: 'हाईवे आपातकालीन सहायता',
    requestFuel: 'आपातकालीन ईंधन',
    requestTowing: 'टो ट्रक रिकवरी',
    requestMechanic: 'स्पॉट मैकेनिक',
    oneTapSos: 'वन-टैप एसओएस',
    sosAlert: 'हाईवे आपातकालीन एसओएस भेजा गया!',
    driverHub: 'ड्राइवर हब',
    tracker: 'रिक्वेस्ट ट्रैकर',
    providerDispatch: 'पेट्रोल डिस्पैच',
    fuelOutlets: 'पेट्रोल पंप',
    adminMetrics: 'एडमिन ऑपरेशन्स',
    pseResearch: 'पीएसई रिसर्च',
    strandedTitle: 'हाईवे पर ईंधन खत्म या गाड़ी खराब हो गई?',
    strandedSubtitle: 'आपातकालीन पेट्रोल, डीजल, टोइंग या ऑन-स्पॉट मैकेनिक सहायता मिनटों में पाएं—ऑफ़लाइन भी काम करता है।',
    selectService: 'आपातकालीन सेवा चुनें',
    fuelService: 'आपातकालीन ईंधन (पेट्रोल/डीजल)',
    towingService: 'टो ट्रक / रिकवरी वाहन',
    mechanicService: 'ऑन-स्पॉट मैकेनिक और बैटरी जंप',
    vehicleNumber: 'वाहन नंबर',
    contactPhone: 'ड्राइवर संपर्क फोन',
    petrol: 'पेट्रोल',
    diesel: 'डीजल',
    quantity: 'ईंधन की मात्रा',
    location: 'हाईवे स्थान और लैंडमार्क',
    detectGps: 'सैटेलाइट GNSS लोकेशन प्राप्त करें',
    satelliteGnssDirect: 'मोबाइल फोन का इन-बिल्ट सैटेलाइट GNSS सक्रिय',
    reviewConfirm: 'समीक्षा करें और पुष्टि करें',
    offlineBannerTitle: 'ऑफ़लाइन मोड सक्रिय — लोकल स्टोरेज तैयार',
    offlineBannerDesc: 'बिना इंटरनेट के भी आपातकालीन अनुरोध डिवाइस में सुरक्षित रहेगा और नेटवर्क आने पर सिंक होगा।',
    syncNow: 'अभी सिंक करें',
    activeUsers: 'सक्रिय हाईवे उपयोगकर्ता',
    safetyChecklist: 'MoRTH राष्ट्रीय राजमार्ग सुरक्षा निर्देश',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    lowBatteryMode: 'लो बैटरी मोड',
    lowNetworkMode: 'लो नेटवर्क मोड',
    logout: 'साइन आउट',
    login: 'साइन इन',
    allUsers: 'सभी पंजीकृत उपयोगकर्ता',
    actions: 'क्रियाएँ',
    suspend: 'निलंबित करें',
    activate: 'सक्रिय करें',
    userDossier: 'उपयोगकर्ता का पूरा विवरण',
    close: 'बंद करें',
    deleteUser: 'उपयोगकर्ता हटाएं',
    confirmDelete: 'स्थायी रूप से हटाएं',
    addUser: 'नया उपयोगकर्ता जोड़ें',
    emergencyBroadcast: 'हाईवे आपातकालीन प्रसारण',
    broadcastMessage: 'अलर्ट संदेश सामग्री',
    sendBroadcast: 'बुलेटिन प्रसारित करें',
    exportAuditLogs: 'ऑडिट लॉग निर्यात (CSV)',
    incidentControl: 'घटना प्रेषण प्राथमिकता',
    vehicles: 'मेरे वाहन',
    addVehicle: 'वाहन पंजीकृत करें',
    providerStatus: 'पेट्रोलिंग उपलब्धता',
    available: 'उपलब्ध',
    busy: 'मिशन पर तैनात',
    offline: 'ड्यूटी पर नहीं',
    acceptRequest: 'अनुरोध स्वीकार करें',
    markEnRoute: 'मार्ग में चिह्नित करें',
    markArrived: 'पहुंचने पर चिह्नित करें',
    markCompleted: 'सेवा पूर्ण हुई',
    fuelStations: 'सत्यापित हाईवे पेट्रोल पंप',
    emergencyCansStock: 'आपातकालीन कैन स्टॉक',
    callStation: 'स्टेशन को कॉल करें',
    directions: 'दिशा-निर्देश और नक्शा',
    userRole: 'अधिकृत भूमिका',
    noPrivilegeAccess: 'पहुंच प्रतिबंधित — केवल अधिकृत भूमिकाओं के लिए',
    adminCommandCenter: 'राष्ट्रीय राजमार्ग कमांड सेंटर',
    priorityAlerts: 'प्राथमिकता आपातकालीन अलर्ट',
    systemAuditLogs: 'सिस्टम ऑडिट लॉग',
    onlineNow: 'अभी सक्रिय',
    inactive: 'निष्क्रिय',
    corridorSectors: 'हाईवे सुरक्षा सेक्टर',
    fuelPricingReg: 'रियायती ईंधन मूल्य विनियमन',
    fleetAccreditation: 'पेट्रोलिंग यूनिट मान्यता',
    systemHealth: 'सिस्टम डायग्नोस्टिक्स एवं स्वास्थ्य',
    forceDispatch: 'बलपूर्वक प्रेषण',
    declareRestriction: 'सेक्टर प्रतिबंध घोषित करें',
    downloadBackup: 'सिस्टम बैकअप डाउनलोड करें'
  },
  ta: {
    appName: 'ஃப்யூல் ரெஸ்க்யூ',
    emergencyTag: 'நெடுஞ்சாலை அவசர உதவி',
    requestFuel: 'அவசர எரிபொருள்',
    requestTowing: 'டோ டிரக் உதவி',
    requestMechanic: 'மெக்கானிக் உதவி',
    oneTapSos: 'ஒன்-டேப் SOS',
    sosAlert: 'நெடுஞ்சாலை SOS அனுப்பப்பட்டது!',
    driverHub: 'ஓட்டுநர் மையம்',
    tracker: 'கோரிக்கை டிராக்கர்',
    providerDispatch: 'ரோந்து அனுப்புதல்',
    fuelOutlets: 'எரிபொருள் நிலையங்கள்',
    adminMetrics: 'நிர்வாக அளவீடுகள்',
    pseResearch: 'ஆராய்ச்சி விவரங்கள்',
    strandedTitle: 'நெடுஞ்சாலையில் வாகனம் நின்றுவிட்டதா?',
    strandedSubtitle: 'பெட்ரோல், டீசல், டோயிங் அல்லது மெக்கானிக் உதவியை நிமிடங்களில் பெறுங்கள்—இணையம் இல்லாமலும் செயல்படும்.',
    selectService: 'அவசர சேவையைத் தேர்ந்தெடுக்கவும்',
    fuelService: 'அவசர எரிபொருள்',
    towingService: 'டோ டிரக் மீட்பு',
    mechanicService: 'ஸ்பாட் மெக்கானிக் & பேட்டரி ஜம்ப்',
    vehicleNumber: 'வாகன எண்',
    contactPhone: 'தொடர்பு எண்',
    petrol: 'பெட்ரோல்',
    diesel: 'டீசல்',
    quantity: 'எரிபொருள் அளவு',
    location: 'நெடுஞ்சாலை இடம்',
    detectGps: 'செயற்கைக்கோள் GNSS கண்டறிதல்',
    satelliteGnssDirect: 'மொபைல் நேரடி செயற்கைக்கோள் ஜிஎன்எஸ்எஸ்',
    reviewConfirm: 'சரிபார்த்து உறுதிப்படுத்தவும்',
    offlineBannerTitle: 'ஆஃப்லைன் முறை செயலில் உள்ளது',
    offlineBannerDesc: 'இணையம் இல்லாமல் கோரிக்கைகள் சாதனத்தில் சேமிக்கப்படும்.',
    syncNow: 'இப்போது ஒத்திசைக்க',
    activeUsers: 'செயலில் உள்ள பயனர்கள்',
    safetyChecklist: 'MoRTH நெடுஞ்சாலை பாதுகாப்பு நெறிமுறைகள்',
    lightMode: 'லைட் மோட்',
    darkMode: 'டார்க் மோட்',
    lowBatteryMode: 'குறைந்த பேட்டரி பயன்முறை',
    lowNetworkMode: 'குறைந்த தரவு பயன்முறை',
    logout: 'வெளியேறு',
    login: 'உள்நுழை',
    allUsers: 'பதிவுசெய்யப்பட்ட பயனர்கள்',
    actions: 'செயல்கள்',
    suspend: 'இடைநீக்கம்',
    activate: 'செயல்படுத்து',
    userDossier: 'முழு பயனர் விவரங்கள்',
    close: 'மூடு',
    deleteUser: 'பயனரை நீக்கு',
    confirmDelete: 'நிரந்தரமாக நீக்கு',
    addUser: 'புதிய பயனரைச் சேர்',
    emergencyBroadcast: 'நெடுஞ்சாலை அவசர எச்சரிக்கை',
    broadcastMessage: 'எச்சரிக்கை செய்தி',
    sendBroadcast: 'எச்சரிக்கையை ஒளிபரப்பு',
    exportAuditLogs: 'தணிக்கை பதிவுகளை ஏற்றுமதி (CSV)',
    incidentControl: 'சம்பவ முன்னுரிமை கட்டுப்பாடு',
    vehicles: 'என் வாகனங்கள்',
    addVehicle: 'வாகனத்தைப் பதிவுசெய்',
    providerStatus: 'ரோந்து கிடைக்கும் நிலை',
    available: 'கிடைக்கிறது',
    busy: 'பணியில் உள்ளது',
    offline: 'பணியில் இல்லை',
    acceptRequest: 'கோரிக்கையை ஏற்றுக்கொள்',
    markEnRoute: 'வழியில் உள்ளதாகக் குறி',
    markArrived: 'வந்தடைந்ததாகக் குறி',
    markCompleted: 'பணி நிறைவடைந்தது',
    fuelStations: 'சரிபார்க்கப்பட்ட நெடுஞ்சாலை நிலையங்கள்',
    emergencyCansStock: 'அவசர கேன்கள் இருப்பு',
    callStation: 'நிலையத்தை அழைக்கவும்',
    directions: 'திசைகள் & வரைபடம்',
    userRole: 'அங்கீகரிக்கப்பட்ட பாத்திரம்',
    noPrivilegeAccess: 'அனுமதி மறுக்கப்பட்டது — உரிய பாத்திரங்களுக்கு மட்டுமே',
    adminCommandCenter: 'நெடுஞ்சாலை கட்டளை மையம்',
    priorityAlerts: 'முன்னுரிமை அவசர எச்சரிக்கைகள்',
    systemAuditLogs: 'சிஸ்டம் தணிக்கை பதிவுகள்',
    onlineNow: 'இப்போது செயலில்',
    inactive: 'செயலற்ற',
    corridorSectors: 'நெடுஞ்சாலை பாதுகாப்பு பிரிவுகள்',
    fuelPricingReg: 'மானிய எரிபொருள் விலை ஒழுங்குமுறை',
    fleetAccreditation: 'ரோந்து வாகன அங்கீகாரம்',
    systemHealth: 'கணினி நிலை & ஆரோக்கியம்',
    forceDispatch: 'கட்டாய ரோந்து அனுப்புதல்',
    declareRestriction: 'பிரிவு கட்டுப்பாட்டை அறிவிக்கவும்',
    downloadBackup: 'கணினி காப்புப்பிரதி பதிவிறக்கம்'
  },
  kn: {
    appName: 'ಫ್ಯೂಯಲ್ ರೆಸ್ಕ್ಯೂ',
    emergencyTag: 'ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ತುರ್ತು ನೆರವು',
    requestFuel: 'ತುರ್ತು ಇಂಧನ',
    requestTowing: 'ಟೋಯಿಂಗ್ ಸೇವೆ',
    requestMechanic: 'ಸ್ಪಾಟ್ ಮೆಕ್ಯಾನಿಕ್',
    oneTapSos: 'ಒನ್-ಟ್ಯಾಪ್ SOS',
    sosAlert: 'ಹೆದ್ದಾರಿ ತುರ್ತು SOS ಕಳುಹಿಸಲಾಗಿದೆ!',
    driverHub: 'ಚಾಲಕರ ಕೇಂದ್ರ',
    tracker: 'ಟ್ರಾಕರ್',
    providerDispatch: 'ಪ್ಯಾಟ್ರೋಲ್ ರವಾನೆ',
    fuelOutlets: 'ಪೆಟ್ರೋಲ್ ಬಂಕ್‌ಗಳು',
    adminMetrics: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    pseResearch: 'ಸಂಶೋಧನಾ ಮಾಹಿತಿ',
    strandedTitle: 'ಹೆದ್ದಾರಿಯಲ್ಲಿ ವಾಹನ ನಿಂತುಹೋಗಿದೆಯೇ?',
    strandedSubtitle: 'ಇಂಧನ, ಟೋಯಿಂಗ್ ಅಥವಾ ರಿಪೇರಿ ಸಹಾಯವನ್ನು ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಪಡೆಯಿರಿ—ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    selectService: 'ತುರ್ತು ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    fuelService: 'ತುರ್ತು ಇಂಧನ (ಪೆಟ್ರೋಲ್/ಡೀಸೆಲ್)',
    towingService: 'ಟೋ ಟ್ರಕ್ ರಿಕವರಿ',
    mechanicService: 'ಆನ್-ಸ್ಪಾಟ್ ಮೆಕ್ಯಾನಿಕ್',
    vehicleNumber: 'ವಾಹನ ಸಂಖ್ಯೆ',
    contactPhone: 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ',
    petrol: 'ಪೆಟ್ರೋಲ್',
    diesel: 'ಡೀಸೆಲ್',
    quantity: 'ಇಂಧನದ ಪ್ರಮಾಣ',
    location: 'ಹೆದ್ದಾರಿ ಸ್ಥಳ',
    detectGps: 'ಉಪಗ್ರಹ GNSS ಸ್ಥಳ ಪತ್ತೆ',
    satelliteGnssDirect: 'ಫೋನ್‌ ಬಿಲ್ಟ್-ಇನ್ ಸ್ಯಾಟಲೈಟ್ GNSS ಸಕ್ರಿಯ',
    reviewConfirm: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ದೃಢೀಕರಿಸಿ',
    offlineBannerTitle: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    offlineBannerDesc: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ವಿನಂತಿಗಳನ್ನು ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ.',
    syncNow: 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ',
    activeUsers: 'ಸಕ್ರಿಯ ಬಳಕೆದಾರರು',
    safetyChecklist: 'MoRTH ಹೆದ್ದಾರಿ ಸುರಕ್ಷತಾ ನಿಯಮಗಳು',
    lightMode: 'ಲೈಟ್ ಮೋಡ್',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    lowBatteryMode: 'ಕಡಿಮೆ ಬ್ಯಾಟರಿ ಮೋಡ್',
    lowNetworkMode: 'ಕಡಿಮೆ ಡೇಟಾ ಮೋಡ್',
    logout: 'ಸೈನ್ ಔಟ್',
    login: 'ಸೈನ್ ಇನ್',
    allUsers: 'ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು',
    actions: 'ಕ್ರಿಯೆಗಳು',
    suspend: 'ಅಮಾನತುಗೊಳಿಸಿ',
    activate: 'ಸಕ್ರಿಯಗೊಳಿಸಿ',
    userDossier: 'ಬಳಕೆದಾರರ ಪೂರ್ಣ ವಿವರಗಳು',
    close: 'ಮುಚ್ಚಿ',
    deleteUser: 'ಬಳಕೆದಾರರನ್ನು ಅಳಿಸಿ',
    confirmDelete: 'ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ',
    addUser: 'ಹೊಸ ಬಳಕೆದಾರರನ್ನು ಸೇರಿಸಿ',
    emergencyBroadcast: 'ಹೆದ್ದಾರಿ ತುರ್ತು ಪ್ರಸಾರ',
    broadcastMessage: 'ಎಚ್ಚರಿಕೆ ಸಂದೇಶದ ವಿಷಯ',
    sendBroadcast: 'ಬುಲೆಟಿನ್ ಪ್ರಸಾರ ಮಾಡಿ',
    exportAuditLogs: 'ಆಡಿಟ್ ಲಾಗ್‌ಗಳ ರಫ್ತು (CSV)',
    incidentControl: 'ಘಟನೆ ರವಾನೆ ಆದ್ಯತೆ',
    vehicles: 'ನನ್ನ ವಾಹನಗಳು',
    addVehicle: 'ವಾಹನವನ್ನು ನೋಂದಾಯಿಸಿ',
    providerStatus: 'ಪ್ಯಾಟ್ರೋಲ್ ಲಭ್ಯತೆ',
    available: 'ಲಭ್ಯವಿದೆ',
    busy: 'ಕಾರ್ಯನಿರತ',
    offline: 'ಕರ್ತವ್ಯದಿಂದ ಹೊರಗೆ',
    acceptRequest: 'ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿ',
    markEnRoute: 'ಮಾರ್ಗಮಧ್ಯೆ ಎಂದು ಗುರುತಿಸಿ',
    markArrived: 'ತಲುಪಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    markCompleted: 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ',
    fuelStations: 'ದೃಢೀಕೃತ ಹೆದ್ದಾರಿ ಪೆಟ್ರೋಲ್ ಬಂಕ್‌ಗಳು',
    emergencyCansStock: 'ತುರ್ತು ಕ್ಯಾನುಗಳ ದಾಸ್ತಾನು',
    callStation: 'ಸ್ಟೇಷನ್‌ಗೆ ಕರೆ ಮಾಡಿ',
    directions: 'ನಕ್ಷೆ ಮಾರ್ಗದರ್ಶನ',
    userRole: 'ಅಧಿಕೃತ ಪಾತ್ರ',
    noPrivilegeAccess: 'ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ — ಅಧಿಕೃತ ಪಾತ್ರಗಳಿಗೆ ಮಾತ್ರ',
    adminCommandCenter: 'ರಾಷ್ಟ್ರೀಯ ಹೆದ್ದಾರಿ ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ',
    priorityAlerts: 'ಆದ್ಯತೆಯ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    systemAuditLogs: 'ಸಿಸ್ಟಮ್ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು',
    onlineNow: 'ಈಗ ಸಕ್ರಿಯ',
    inactive: 'ನಿಷ್ಕ್ರಿಯ',
    corridorSectors: 'ಹೆದ್ದಾರಿ ಸುರಕ್ಷತಾ ವಲಯಗಳು',
    fuelPricingReg: 'ಸಬ್ಸಿಡಿ ಇಂಧನ ದರ ನಿಯಂತ್ರಣ',
    fleetAccreditation: 'ಪ್ಯಾಟ್ರೋಲ್ ಘಟಕ ಮಾನ್ಯತೆ',
    systemHealth: 'ಸಿಸ್ಟಮ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್',
    forceDispatch: 'ಬಲವಂತದ ರವಾನೆ',
    declareRestriction: 'ವಲಯ ನಿರ್ಬಂಧ ಘೋಷಿಸಿ',
    downloadBackup: 'ಸಿಸ್ಟಮ್ ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್'
  }
};
