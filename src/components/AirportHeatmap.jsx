// This file shows the airport congestion heatmap view.
import React, { useState, useMemo } from 'react';
import { AIRPORTS } from '../data/constants.js';

// Generate realistic congestion data for each airport × hour
function generateCongestionData() {
    const data = {};

    // Base congestion multipliers by airport size
    const airportTiers = {
        DEL: 1.3, BOM: 1.3, BLR: 1.2, MAA: 1.1, CCU: 1.1,
        HYD: 1.05, COK: 0.9, AMD: 0.95, PNQ: 0.85, GOI: 0.8,
        JAI: 0.85, GAU: 0.7, IXC: 0.7, TRV: 0.75, VNS: 0.65,
    };

    // Hour-of-day pattern (0–23): morning rush, afternoon dip, evening rush, night quiet
    const hourPattern = [
        12, 10, 8, 8, 10, 18,   // 00–05: very low → ramp up
        45, 65, 80, 85, 72, 55, // 06–11: morning rush
        48, 42, 40, 45, 55, 70, // 12–17: afternoon lull → evening ramp
        82, 88, 78, 60, 40, 22, // 18–23: evening rush → wind down
    ];

    AIRPORTS.forEach(airport => {
        const tier = airportTiers[airport.code] || 0.8;
        const row = [];
        for (let h = 0; h < 24; h++) {
            // Base from pattern × tier, add randomness ±10
            const base = hourPattern[h] * tier;
            // This function handles jitter.
            const jitter = (Math.random() - 0.5) * 20;
            const value = Math.max(2, Math.min(100, Math.round(base + jitter)));
            row.push(value);
        }
        data[airport.code] = row;
    });

    return data;
}

// This function handles get congestion color.
function getCongestionColor(value) {
    if (value <= 25) return { bg: 'rgba(34, 197, 94, 0.7)', label: 'Low' };
    if (value <= 50) return { bg: 'rgba(234, 179, 8, 0.65)', label: 'Moderate' };
    if (value <= 75) return { bg: 'rgba(249, 115, 22, 0.75)', label: 'Busy' };
    return { bg: 'rgba(239, 68, 68, 0.85)', label: 'Very Busy' };
}

// This function handles get congestion text color.
function getCongestionTextColor(value) {
    if (value <= 25) return '#22c55e';
    if (value <= 50) return '#eab308';
    if (value <= 75) return '#f97316';
    return '#ef4444';
}

// This component renders the airport heatmap view.
export default function AirportHeatmap() {
    const [congestionData] = useState(() => generateCongestionData());
    const [tooltip, setTooltip] = useState(null);
    const [selectedAirport, setSelectedAirport] = useState(null);
    const currentHour = new Date().getHours();

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Compute overall busiest airport and hour
    const stats = useMemo(() => {
        let busiestAirport = { code: '', avg: 0 };
        let peakHour = { hour: 0, avg: 0 };
        const hourTotals = new Array(24).fill(0);
        let hourCounts = 0;

        AIRPORTS.forEach(airport => {
            const row = congestionData[airport.code];
            const avg = row.reduce((a, b) => a + b, 0) / 24;
            if (avg > busiestAirport.avg) busiestAirport = { code: airport.code, city: airport.city, avg };
            row.forEach((v, h) => { hourTotals[h] += v; });
        });

        hourTotals.forEach((total, h) => {
            const avg = total / AIRPORTS.length;
            if (avg > peakHour.avg) peakHour = { hour: h, avg };
        });

        const currentAvg = hourTotals[currentHour] / AIRPORTS.length;

        return { busiestAirport, peakHour, currentAvg };
    }, [congestionData, currentHour]);

    // This function handles format hour.
    const formatHour = (h) => {
        if (h === 0) return '12AM';
        if (h < 12) return `${h}AM`;
        if (h === 12) return '12PM';
        return `${h - 12}PM`;
    };

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                    🔥 Airport Congestion Heatmap
                </h1>
                <p style={{ color: '#999', fontSize: '1.1rem' }}>
                    Visualize how busy Indian airports are throughout the day. Data is simulated based on realistic traffic patterns.
                </p>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Current Avg Congestion', value: `${Math.round(stats.currentAvg)}%`, icon: '📊', color: getCongestionTextColor(stats.currentAvg) },
                    { label: 'Busiest Airport', value: `${stats.busiestAirport.code}`, sub: stats.busiestAirport.city, icon: '🏢', color: '#ef4444' },
                    { label: 'Peak Hour', value: formatHour(stats.peakHour.hour), sub: `${Math.round(stats.peakHour.avg)}% avg`, icon: '⏰', color: '#f59e0b' },
                    { label: 'Current Hour', value: formatHour(currentHour), icon: '🕐', color: 'var(--accent-primary)' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        background: '#1e1e1e', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{ fontSize: '1.8rem' }}>{stat.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1.2 }}>{stat.value}</div>
                            {stat.sub && <div style={{ fontSize: '0.85rem', color: '#999' }}>{stat.sub}</div>}
                            <div style={{ fontSize: '0.85rem', color: '#777', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="heatmap-legend">
                <span style={{ color: '#999', fontWeight: 600, marginRight: '0.75rem', fontSize: '0.95rem' }}>Congestion Level:</span>
                {[
                    { label: 'Low (0–25%)', color: 'rgba(34, 197, 94, 0.7)' },
                    { label: 'Moderate (26–50%)', color: 'rgba(234, 179, 8, 0.65)' },
                    { label: 'Busy (51–75%)', color: 'rgba(249, 115, 22, 0.75)' },
                    { label: 'Very Busy (76–100%)', color: 'rgba(239, 68, 68, 0.85)' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: item.color }} />
                        <span style={{ color: '#ccc', fontSize: '0.9rem' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="heatmap-wrapper">
                <table className="heatmap-table">
                    <thead>
                        <tr>
                            <th className="heatmap-airport-header">Airport</th>
                            {hours.map(h => (
                                <th key={h} className={`heatmap-hour-header ${h === currentHour ? 'heatmap-current-hour' : ''}`}>
                                    {formatHour(h)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {AIRPORTS.map(airport => (
                            <tr
                                key={airport.code}
                                className={`heatmap-row ${selectedAirport === airport.code ? 'heatmap-row-selected' : ''}`}
                                onClick={() => setSelectedAirport(prev => prev === airport.code ? null : airport.code)}
                            >
                                <td className="heatmap-airport-cell">
                                    <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1rem' }}>{airport.code}</div>
                                    <div style={{ color: '#888', fontSize: '0.78rem', lineHeight: 1.2 }}>{airport.city}</div>
                                </td>
                                {hours.map(h => {
                                    const value = congestionData[airport.code][h];
                                    const { bg, label } = getCongestionColor(value);
                                    return (
                                        <td
                                            key={h}
                                            className={`heatmap-cell ${h === currentHour ? 'heatmap-current-hour-cell' : ''}`}
                                            style={{ background: bg }}
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    x: rect.left + rect.width / 2,
                                                    y: rect.top - 10,
                                                    airport: `${airport.code} — ${airport.name}`,
                                                    city: airport.city,
                                                    hour: formatHour(h),
                                                    value,
                                                    label,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            <span className="heatmap-cell-value">{value}</span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="heatmap-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <div style={{ fontWeight: 700, color: '#f0f0f0', marginBottom: '4px', fontSize: '0.95rem' }}>{tooltip.airport}</div>
                    <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '6px' }}>{tooltip.hour}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: getCongestionTextColor(tooltip.value) }}>{tooltip.value}%</span>
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 8px', borderRadius: '4px',
                            background: getCongestionColor(tooltip.value).bg,
                            color: '#fff',
                        }}>{tooltip.label}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
