// This file shows an India map with flight route visuals.
import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AIRPORTS } from '../data/constants.js';

// Build a lookup: IATA code → { lat, lng, ... }
const AIRPORT_COORDS = {};
AIRPORTS.forEach(ap => {
    if (ap.lat && ap.lng) {
        AIRPORT_COORDS[ap.code] = ap;
    }
});

// Risk level → color
const RISK_COLORS = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
};

/**
 * Compute a curved arc between two [lat, lng] points.
 */
function computeArc(from, to, segments = 30) {
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    // This function handles mid lat.
    const midLat = (lat1 + lat2) / 2;
    // This function handles mid lng.
    const midLng = (lng1 + lng2) / 2;
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist === 0) return [[lat1, lng1], [lat2, lng2]];
    const curvature = dist * 0.2;
    const ctrlLat = midLat + (dLng / dist) * curvature;
    const ctrlLng = midLng - (dLat / dist) * curvature;

    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const u = 1 - t;
        const lat = u * u * lat1 + 2 * u * t * ctrlLat + t * t * lat2;
        const lng = u * u * lng1 + 2 * u * t * ctrlLng + t * t * lng2;
        points.push([lat, lng]);
    }
    return points;
}

// This component renders the india flight map view.
export default function IndiaFlightMap({ flights = [] }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Process flights into route data with coordinates
    const routes = useMemo(() => {
        return flights
            .map(flight => {
                // Get origin coordinates - try AIRPORT_COORDS lookup first, then the object itself
                const originCode = typeof flight.origin === 'string' ? flight.origin : flight.origin?.code;
                const destCode = typeof flight.destination === 'string' ? flight.destination : flight.destination?.code;

                let originCoords = AIRPORT_COORDS[originCode];
                let destCoords = AIRPORT_COORDS[destCode];

                // Fallback: if the flight object itself has lat/lng, use it
                if (!originCoords && flight.origin?.lat && flight.origin?.lng) {
                    originCoords = flight.origin;
                }
                if (!destCoords && flight.destination?.lat && flight.destination?.lng) {
                    destCoords = flight.destination;
                }

                if (!originCoords?.lat || !originCoords?.lng || !destCoords?.lat || !destCoords?.lng) return null;
                if (originCode === destCode) return null;

                const color = RISK_COLORS[flight.riskLevel] || RISK_COLORS.low;
                const arc = computeArc([originCoords.lat, originCoords.lng], [destCoords.lat, destCoords.lng]);

                return {
                    id: flight.id || flight.flightNumber || Math.random().toString(),
                    flightNumber: flight.flightNumber,
                    airline: flight.airline,
                    origin: { ...originCoords, code: originCode },
                    dest: { ...destCoords, code: destCode },
                    riskLevel: flight.riskLevel,
                    color,
                    arc,
                    predictedDelay: flight.predictedDelay || 0,
                };
            })
            .filter(Boolean);
    }, [flights]);

    // This function handles airport activity.
    const airportActivity = useMemo(() => {
        const counts = {};
        routes.forEach(r => {
            counts[r.origin.code] = (counts[r.origin.code] || 0) + 1;
            counts[r.dest.code] = (counts[r.dest.code] || 0) + 1;
        });
        return counts;
    }, [routes]);

    // This function handles delayed airports.
    const delayedAirports = useMemo(() => {
        const delayed = new Set();
        routes.forEach(r => {
            if (r.riskLevel === 'high' || r.riskLevel === 'critical') {
                delayed.add(r.origin.code);
            }
        });
        return delayed;
    }, [routes]);

    // This function handles active airports.
    const activeAirports = useMemo(() => {
        return AIRPORTS.filter(ap => ap.lat && ap.lng && airportActivity[ap.code]);
    }, [airportActivity]);

    const highRisk = routes.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length;

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [22.5, 79.5],
            zoom: 5,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Draw flight arcs and airport markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Create a layer group for all our overlays so we can clear and redraw
        const layerGroup = L.layerGroup().addTo(map);

        // Draw flight arcs
        routes.forEach(route => {
            // Glow layer
            L.polyline(route.arc, {
                color: route.color,
                weight: 4,
                opacity: 0.15,
            }).addTo(layerGroup);

            // Main dashed arc
            const arcLine = L.polyline(route.arc, {
                color: route.color,
                weight: 2,
                opacity: 0.7,
                dashArray: '8, 6',
            }).addTo(layerGroup);

            arcLine.bindTooltip(
                `<div style="font-family:'Inter',sans-serif;font-size:13px">
                    <div style="font-weight:700">${route.airline} — ${route.flightNumber}</div>
                    <div style="color:#666">${route.origin.code} → ${route.dest.code}</div>
                    <div style="color:${route.color};font-weight:600;text-transform:capitalize">
                        ${route.riskLevel} risk${route.predictedDelay > 0 ? ` • ${route.predictedDelay} min delay` : ''}
                    </div>
                </div>`,
                { sticky: true }
            );
        });

        // Draw airport markers
        activeAirports.forEach(ap => {
            const count = airportActivity[ap.code] || 0;
            const isDelayed = delayedAirports.has(ap.code);
            const radius = Math.max(5, Math.min(12, 4 + count * 1.5));

            // Pulse ring for delayed airports
            if (isDelayed) {
                L.circleMarker([ap.lat, ap.lng], {
                    radius: radius + 6,
                    color: '#ef4444',
                    weight: 1.5,
                    opacity: 0.4,
                    fillColor: '#ef4444',
                    fillOpacity: 0.08,
                }).addTo(layerGroup);
            }

            // Main marker
            const marker = L.circleMarker([ap.lat, ap.lng], {
                radius,
                color: isDelayed ? '#ef4444' : '#F5C400',
                weight: 2,
                opacity: 0.9,
                fillColor: isDelayed ? '#ef4444' : '#F5C400',
                fillOpacity: 0.3,
            }).addTo(layerGroup);

            marker.bindTooltip(
                `<div style="font-family:'Inter',sans-serif;font-size:13px">
                    <div style="font-weight:700">${ap.code} — ${ap.city}</div>
                    <div style="color:#666">${ap.name}</div>
                    <div style="font-weight:600;color:${isDelayed ? '#ef4444' : '#22c55e'}">
                        ${count} active flight${count !== 1 ? 's' : ''}${isDelayed ? ' • Delays detected' : ''}
                    </div>
                </div>`
            );
        });

        return () => {
            layerGroup.remove();
        };
    }, [routes, activeAirports, airportActivity, delayedAirports]);

    return (
        <div className="flight-map-section">
            <div className="container">
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    {/* Title bar */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>🗺️</span>
                            <h3 style={{
                                color: '#f0f0f0', fontSize: 18, fontWeight: 800,
                                margin: 0, letterSpacing: '-0.02em',
                            }}>
                                India Flight Map
                            </h3>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: '#22c55e',
                                background: 'rgba(34,197,94,0.15)', padding: '2px 8px',
                                borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>LIVE</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                            {routes.length} active routes across India
                        </div>
                    </div>

                    {/* Map container */}
                    <div style={{ height: 500, position: 'relative' }}>
                        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

                        {/* Stats overlay */}
                        <div style={{
                            position: 'absolute', top: 16, left: 16, zIndex: 1000,
                            background: 'rgba(17, 17, 17, 0.92)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                            padding: '12px 16px', fontFamily: "'Inter', sans-serif",
                            pointerEvents: 'none',
                        }}>
                            <div style={{ color: '#f0f0f0', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                                ✈️ Live Flight Routes
                            </div>
                            <div style={{ color: '#a0a0a0', fontSize: 13 }}>
                                <span style={{ color: '#22c55e', fontWeight: 700 }}>{routes.length}</span> active •{' '}
                                <span style={{ color: '#ef4444', fontWeight: 700 }}>{highRisk}</span> high risk
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{
                            position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
                            background: 'rgba(17, 17, 17, 0.92)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                            padding: '12px 16px', fontSize: 13, fontWeight: 600,
                            color: '#a0a0a0', fontFamily: "'Inter', sans-serif",
                            pointerEvents: 'none',
                        }}>
                            <div style={{ color: '#f0f0f0', fontWeight: 800, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Flight Risk
                            </div>
                            {Object.entries(RISK_COLORS).map(([level, color]) => (
                                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <div style={{ width: 12, height: 3, borderRadius: 2, background: color }} />
                                    <span style={{ textTransform: 'capitalize' }}>{level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
