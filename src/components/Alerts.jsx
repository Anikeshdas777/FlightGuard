import React, { useState, useMemo } from 'react';

// Dark theme tokens
const D = {
    bg: '#111111',
    card: '#1e1e1e',
    cardAlt: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.07)',
    textPri: '#f0f0f0',
    textSec: '#a0a0a0',
    textMut: '#666666',
    accent: '#F5C400',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#60a5fa',
    orange: '#f59e0b',
};

const STATIC_ALERTS = [
    {
        id: 1, severity: 'critical', category: 'Weather',
        title: 'Dense Fog Advisory — Delhi (DEL)',
        message: 'Visibility below 50m at IGI Airport. Ground stop in effect. Expect cancellations and diversions for all morning departures.',
        time: '2 mins ago', flights: ['AI-402', 'SG-108', 'IX-313', '6E-2045'],
        icon: '🌫️',
    },
    {
        id: 2, severity: 'critical', category: 'Weather',
        title: 'Cyclone Warning — Mumbai (BOM)',
        message: 'NDMA Cyclone Alert Level 3 issued for Coastal Maharashtra. Possible airport closure between 18:00–22:00 IST.',
        time: '8 mins ago', flights: ['AI-864', '6E-512', 'SG-301'],
        icon: '🌀',
    },
    {
        id: 3, severity: 'high', category: 'Operational',
        title: 'Runway Maintenance — Kochi (COK)',
        message: 'Runway 09/27 closed for resurfacing. All flights using Taxiway B. Expecting 25-40 min delays for arrivals.',
        time: '15 mins ago', flights: ['AI-543', '9W-821'],
        icon: '🚧',
    },
    {
        id: 4, severity: 'high', category: 'Weather',
        title: 'Thunderstorm Alert — Kolkata (CCU)',
        message: 'Severe thunderstorm cell detected 40km southwest. Expected to reach airport perimeter within 90 minutes.',
        time: '22 mins ago', flights: ['AI-745', '6E-403', 'QP-101'],
        icon: '⛈️',
    },
    {
        id: 5, severity: 'medium', category: 'Operational',
        title: 'ATC Staffing Delay — Chennai (MAA)',
        message: 'Reduced ATC capacity until 14:30 IST. Departure slots reduced by 30%. Expect 15-20 min taxi delays.',
        time: '35 mins ago', flights: ['AI-431', 'UK-822'],
        icon: '🎙️',
    },
    {
        id: 6, severity: 'medium', category: 'Security',
        title: 'Security Check — Bengaluru (BLR)',
        message: 'Enhanced security screening at Terminal 2. Passengers advised to arrive 30 mins earlier than usual.',
        time: '1 hr ago', flights: [],
        icon: '🔒',
    },
    {
        id: 7, severity: 'low', category: 'Info',
        title: 'New Terminal — Hyderabad (HYD)',
        message: 'International Terminal T2 opens from March 15. All Air India international flights will shift to T2.',
        time: '3 hrs ago', flights: [],
        icon: '🏗️',
    },
    {
        id: 8, severity: 'low', category: 'Info',
        title: 'Monsoon Season Forecast 2024',
        message: 'IMD predicts above-normal monsoon (106% of LPA). Western Coast and Northeast India to see highest disruption risk Jun–Sep.',
        time: '5 hrs ago', flights: [],
        icon: '🌧️',
    },
];

const SEVERITY_CONFIG = {
    critical: { color: D.red, bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: '🔴 Critical' },
    high: { color: D.orange, bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: '🟠 High' },
    medium: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', label: '🟡 Medium' },
    low: { color: D.green, bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: '🟢 Low' },
};

const CATEGORIES = ['All', 'Weather', 'Operational', 'Security', 'News', 'Info'];

export default function Alerts({ liveAlerts = [], alarmingNews = [] }) {
    const [filter, setFilter] = useState('All');
    const [dismissed, setDismissed] = useState(new Set());

    // Merge static + live flight alerts + alarming news
    const allAlerts = useMemo(() => {
        return [...STATIC_ALERTS, ...liveAlerts, ...alarmingNews];
    }, [liveAlerts, alarmingNews]);

    const hasLiveData = liveAlerts.length > 0 || alarmingNews.length > 0;

    const visible = allAlerts.filter(a =>
        !dismissed.has(a.id) && (filter === 'All' || a.category === filter)
    );

    const criticalCount = allAlerts.filter(a => a.severity === 'critical' && !dismissed.has(a.id)).length;
    const highCount = allAlerts.filter(a => a.severity === 'high' && !dismissed.has(a.id)).length;
    const liveCount = allAlerts.filter(a => a.isLive && !dismissed.has(a.id)).length;

    return (
        <div style={{ paddingBottom: 60, background: D.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <section style={{ padding: '40px 0 28px', textAlign: 'center', background: 'transparent', borderBottom: `1px solid ${D.border}` }}>
                <div className="container">
                    <h1 style={{ color: D.accent, fontSize: 35, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.04em' }}>
                        Alert Center
                        {hasLiveData && (
                            <span style={{
                                marginLeft: 12,
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#22c55e',
                                background: 'rgba(34,197,94,0.15)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: '1px solid rgba(34,197,94,0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                verticalAlign: 'middle',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginRight: 6, animation: 'livePulse 2s infinite' }} />
                                LIVE
                            </span>
                        )}
                    </h1>
                    <p style={{ color: D.textSec, fontSize: 18, fontWeight: 400 }}>
                        Real-time flight disruption alerts and advisories across Indian airports
                    </p>
                    {hasLiveData && (
                        <p style={{ color: D.blue, fontSize: 14, fontWeight: 600, marginTop: 8 }}>
                            📡 {liveCount} live alert{liveCount !== 1 ? 's' : ''} from AviationStack API + alarming news
                        </p>
                    )}
                </div>
            </section>

            <div className="container" style={{ paddingTop: 24 }}>

                {/* Live status banner */}
                {criticalCount > 0 && (
                    <div style={{
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '16px 20px', marginBottom: 24,
                        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                        boxShadow: '0 4px 12px rgba(239,68,68,0.1)'
                    }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: D.red, flexShrink: 0, boxShadow: `0 0 10px ${D.red}80` }} />
                        <div style={{ color: '#fca5a5', fontWeight: 800, fontSize: 18 }}>
                            {criticalCount} Critical + {highCount} High-Priority Alerts Active
                        </div>
                        <div style={{ color: '#f87171', fontSize: 17, fontWeight: 500 }}>
                            Airport operations may be impacted — check details below
                        </div>
                    </div>
                )}

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
                    {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => {
                        const count = allAlerts.filter(a => a.severity === sev && !dismissed.has(a.id)).length;
                        return (
                            <div key={sev} style={{
                                background: D.card, border: `1px solid ${cfg.border}`,
                                borderRadius: 8, padding: '16px 20px', textAlign: 'center',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)',
                                transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = D.card}
                            >
                                <div style={{ color: cfg.color, fontSize: 31, fontWeight: 800, lineHeight: 1, textShadow: `0 0 15px ${cfg.color}50` }}>{count}</div>
                                <div style={{ color: D.textSec, fontSize: 15, textTransform: 'uppercase', marginTop: 8, fontWeight: 700, letterSpacing: '0.05em' }}>{sev} Alerts</div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} style={{
                            padding: '6px 16px', borderRadius: 4, cursor: 'pointer',
                            fontWeight: 700, fontSize: 16,
                            background: filter === cat ? D.accent : 'transparent',
                            color: filter === cat ? '#111111' : D.textSec,
                            border: filter === cat ? `1px solid ${D.accent}` : `1px solid ${D.border}`,
                            transition: 'all 0.2s',
                            boxShadow: filter === cat ? '0 0 15px rgba(245,196,0,0.3)' : 'none'
                        }}
                            onMouseEnter={e => { if (filter !== cat) { e.currentTarget.style.borderColor = 'rgba(245,196,0,0.4)'; e.currentTarget.style.color = '#f0f0f0' } }}
                            onMouseLeave={e => { if (filter !== cat) { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.color = D.textSec } }}
                        >
                            {cat}
                        </button>
                    ))}
                    {dismissed.size > 0 && (
                        <button onClick={() => setDismissed(new Set())} style={{
                            padding: '6px 16px', borderRadius: 4,
                            cursor: 'pointer', background: 'transparent', color: D.textMut, fontSize: 16,
                            border: `1px solid ${D.border}`, transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = D.textPri }}
                            onMouseLeave={e => { e.currentTarget.style.color = D.textMut }}
                        >
                            ↩ Restore {dismissed.size} dismissed
                        </button>
                    )}
                </div>

                {/* Alert list */}
                {visible.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: D.textMut }}>
                        <div style={{ fontSize: 51, marginBottom: 12 }}>✅</div>
                        <div style={{ fontSize: 23, fontWeight: 800, color: D.textPri, marginBottom: 8 }}>All Clear</div>
                        <div>No active alerts in this category</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {visible.map(alert => {
                            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
                            return (
                                <div key={alert.id} style={{
                                    background: D.card, border: `1px solid ${D.border}`, borderLeft: `6px solid ${cfg.color}`,
                                    borderRadius: 8, padding: '16px 20px',
                                    display: 'flex', gap: 16, alignItems: 'flex-start',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)', transition: 'all 0.2s',
                                    cursor: alert.url ? 'pointer' : 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,196,0,0.2)'; e.currentTarget.style.borderLeftColor = cfg.color }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.borderLeftColor = cfg.color }}
                                    onClick={() => alert.url && window.open(alert.url, '_blank')}
                                >
                                    <div style={{ fontSize: 27, flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}`, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>{alert.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 4, fontSize: 14,
                                                background: cfg.bg, color: cfg.color, fontWeight: 800, border: `1px solid ${cfg.border}`, textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}>{cfg.label}</span>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 4, fontSize: 14,
                                                background: D.cardAlt, color: D.textSec, fontWeight: 800, border: `1px solid ${D.border}`, textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}>{alert.category}</span>
                                            {alert.isLive && (
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: 4, fontSize: 12,
                                                    background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 800,
                                                    border: '1px solid rgba(34,197,94,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em'
                                                }}>LIVE</span>
                                            )}
                                            <span style={{ color: D.textMut, fontSize: 15, marginLeft: 'auto', fontWeight: 600 }}>{alert.time}</span>
                                        </div>
                                        <div style={{ color: D.textPri, fontWeight: 800, fontSize: 19, marginBottom: 6 }}>
                                            {alert.title}
                                        </div>
                                        <div style={{ color: D.textSec, fontSize: 17, lineHeight: 1.6, marginBottom: alert.flights && alert.flights.length ? 12 : 0 }}>
                                            {alert.message}
                                        </div>
                                        {alert.flights && alert.flights.length > 0 && (
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <span style={{ color: D.textMut, fontSize: 15, alignSelf: 'center', fontWeight: 700 }}>Affected:</span>
                                                {alert.flights.map(f => (
                                                    <span key={f} style={{
                                                        padding: '2px 8px', borderRadius: 4,
                                                        background: D.cardAlt, border: `1px solid ${D.border}`,
                                                        color: D.accent, fontSize: 15, fontWeight: 700,
                                                    }}>{f}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setDismissed(p => new Set([...p, alert.id])); }} style={{
                                        background: 'transparent', border: 'none', borderRadius: 4,
                                        color: D.textMut, cursor: 'pointer', padding: '4px 8px', fontSize: 21,
                                        flexShrink: 0, transition: 'color 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = D.red}
                                        onMouseLeave={e => e.currentTarget.style.color = D.textMut}
                                        title="Dismiss">✕</button>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
