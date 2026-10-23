import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Filter, Fuel, Shield, AlertCircle, ExternalLink } from 'lucide-react';
import { FuelOutlet, AssistanceProvider, FuelType } from '../types';

interface InteractiveMapProps {
  outlets: FuelOutlet[];
  providers: AssistanceProvider[];
  userLat?: number;
  userLon?: number;
  selectedOutletId?: string;
  onSelectOutlet?: (outlet: FuelOutlet) => void;
  onLocationPick?: (lat: number, lon: number, description: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  outlets,
  providers,
  userLat = 17.6250,
  userLon = 78.4790,
  selectedOutletId,
  onSelectOutlet,
  onLocationPick
}) => {
  const [filterFuel, setFilterFuel] = useState<FuelType | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'MAP' | 'LIST'>('MAP');
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Map bounding coordinates around Hyderabad Highway corridor (Lat: 17.0 to 17.7, Lon: 78.1 to 79.0)
  const minLat = 17.0;
  const maxLat = 17.7;
  const minLon = 78.1;
  const maxLon = 79.0;

  // Convert lat/lon to SVG coordinate space (800 x 500)
  const toSvgX = (lon: number) => {
    return Math.max(40, Math.min(760, ((lon - minLon) / (maxLon - minLon)) * 720 + 40));
  };

  const toSvgY = (lat: number) => {
    // Invert Y because latitude increases northward
    return Math.max(40, Math.min(460, (1 - (lat - minLat) / (maxLat - minLat)) * 420 + 40));
  };

  const filteredOutlets = outlets.filter(o => {
    if (filterFuel === 'PETROL') return o.petrolAvailable;
    if (filterFuel === 'DIESEL') return o.dieselAvailable;
    return true;
  });

  const filteredProviders = providers.filter(p => {
    if (filterFuel === 'ALL') return true;
    return p.supportedFuel.includes(filterFuel);
  });

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onLocationPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert SVG point back to Approximate Lat/Lon
    const scaleX = (clickX / rect.width) * 800;
    const scaleY = (clickY / rect.height) * 500;

    const lon = minLon + ((scaleX - 40) / 720) * (maxLon - minLon);
    const lat = minLat + (1 - (scaleY - 40) / 420) * (maxLat - minLat);

    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLon = Math.round(lon * 10000) / 10000;

    onLocationPick(roundedLat, roundedLon, `Highway GPS Pin [${roundedLat.toFixed(4)}, ${roundedLon.toFixed(4)}]`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Map Control Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Highway Assistance Radar</h3>
            <p className="text-[11px] text-slate-400">Telangana Corridor · NH 44, NH 65, ORR</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setFilterFuel('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterFuel === 'ALL' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterFuel('PETROL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterFuel === 'PETROL' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Petrol
            </button>
            <button
              onClick={() => setFilterFuel('DIESEL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterFuel === 'DIESEL' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Diesel
            </button>
          </div>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'MAP' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'LIST' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nearby Outlets ({filteredOutlets.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'MAP' ? (
        <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden select-none">
          {/* Instructions Overlay */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none bg-slate-900/90 backdrop-blur-sm border border-slate-800 text-[11px] text-slate-300 px-2.5 py-1 rounded-lg">
            Click map to reposition vehicle · Pins show verified outlets & rescue units
          </div>

          <svg
            viewBox="0 0 800 500"
            className="w-full h-full cursor-crosshair"
            onClick={handleMapClick}
          >
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* Arterial Highways Lines */}
            {/* NH 44 (North-South) */}
            <path
              d="M 380 30 Q 395 240 370 480"
              fill="none"
              stroke="#334155"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 380 30 Q 395 240 370 480"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text x="395" y="60" fill="#94a3b8" fontSize="11" fontWeight="bold">NH 44 (Nagpur ↔ Hyderabad ↔ Bengaluru)</text>

            {/* NH 65 (East-West) */}
            <path
              d="M 60 290 Q 360 260 740 240"
              fill="none"
              stroke="#334155"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 60 290 Q 360 260 740 240"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6,4"
            />
            <text x="610" y="230" fill="#94a3b8" fontSize="11" fontWeight="bold">NH 65 (Vijayawada)</text>

            {/* Outer Ring Road (ORR) Circle */}
            <ellipse
              cx="390"
              cy="260"
              rx="150"
              ry="110"
              fill="none"
              stroke="#475569"
              strokeWidth="5"
            />
            <text x="440" y="160" fill="#64748b" fontSize="10">Hyderabad ORR Expressway</text>

            {/* Highway Junction Labels */}
            <circle cx="390" cy="260" r="4" fill="#64748b" />
            <text x="400" y="275" fill="#cbd5e1" fontSize="11" fontWeight="bold">Hyderabad City Center</text>

            {/* Provider Coverage Areas & Patrol Markers */}
            {filteredProviders.map(p => {
              const cx = toSvgX(p.longitude);
              const cy = toSvgY(p.latitude);
              const isAvailable = p.status === 'AVAILABLE';

              return (
                <g key={p.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setHoveredEntity(p.name); }}>
                  {/* Coverage Radius circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={p.coverageRadiusKm * 2.2}
                    fill={isAvailable ? '#10b981' : '#64748b'}
                    fillOpacity="0.08"
                    stroke={isAvailable ? '#10b981' : '#64748b'}
                    strokeWidth="1"
                    strokeDasharray="4,3"
                  />
                  {/* Provider Marker */}
                  <circle cx={cx} cy={cy} r="10" fill="#047857" stroke="#ffffff" strokeWidth="2" filter="url(#glow)" />
                  <path
                    d={`M ${cx - 5} ${cy} L ${cx + 5} ${cy} M ${cx} ${cy - 5} L ${cx} ${cy + 5}`}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <text x={cx + 12} y={cy + 4} fill="#a7f3d0" fontSize="10" fontWeight="600">
                    {p.name.split(' ')[0]} ({p.vehicleType.includes('Bike') ? 'Patrol Bike' : 'Utility'})
                  </text>
                </g>
              );
            })}

            {/* Outlet Markers */}
            {filteredOutlets.map(o => {
              const ox = toSvgX(o.longitude);
              const oy = toSvgY(o.latitude);
              const isSelected = selectedOutletId === o.id;

              return (
                <g
                  key={o.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectOutlet) onSelectOutlet(o);
                    setHoveredEntity(o.name);
                  }}
                >
                  <circle
                    cx={ox}
                    cy={oy}
                    r={isSelected ? '12' : '9'}
                    fill={o.omc === 'IOCL' ? '#ea580c' : o.omc === 'BPCL' ? '#0284c7' : '#ca8a04'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={ox + 12}
                    y={oy + 4}
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {o.omc} · {o.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Current Stranded Vehicle Marker (Pulsing Red/Orange Pin) */}
            <g className="cursor-move">
              <circle
                cx={toSvgX(userLon)}
                cy={toSvgY(userLat)}
                r="22"
                fill="#f97316"
                fillOpacity="0.25"
              >
                <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="fillOpacity" values="0.35;0.05;0.35" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle
                cx={toSvgX(userLon)}
                cy={toSvgY(userLat)}
                r="9"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={toSvgX(userLon) + 12}
                y={toSvgY(userLat) - 6}
                fill="#ffedd5"
                fontSize="11"
                fontWeight="bold"
              >
                Stranded Vehicle (You)
              </text>
            </g>
          </svg>

          {/* Coordinate Indicator Pill */}
          <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-sm border border-slate-800 text-[11px] text-slate-400 px-2.5 py-1 rounded-lg">
            GPS: {userLat.toFixed(4)}° N, {userLon.toFixed(4)}° E
          </div>
        </div>
      ) : (
        /* List View of Outlets and Providers */
        <div className="p-4 divide-y divide-slate-800 max-h-80 overflow-y-auto">
          {filteredOutlets.map(outlet => (
            <div
              key={outlet.id}
              onClick={() => onSelectOutlet?.(outlet)}
              className={`py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 px-2 rounded-xl transition-colors ${
                selectedOutletId === outlet.id ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-orange-400 mt-0.5">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{outlet.name}</h4>
                  <p className="text-xs text-slate-400">{outlet.landmark} · {outlet.highway}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-slate-300">Petrol: ₹{outlet.petrolPrice}/L</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">Diesel: ₹{outlet.dieselPrice}/L</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-medium">{outlet.operatingHours}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-orange-400 block">{outlet.distanceKm} km</span>
                <span className="text-[10px] text-slate-500">Estimated distance</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
