// This file shows the analytics dashboard and trend summaries.
import React from 'react';

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

const AIRLINE_STATS = [
    { name: 'IndiGo', onTime: 81, delayed: 15, cancelled: 4, color: D.blue },
    { name: 'Air India', onTime: 69, delayed: 24, cancelled: 7, color: '#e2e8f0' },
    { name: 'SpiceJet', onTime: 63, delayed: 29, cancelled: 8, color: D.orange },
    { name: 'GoAir', onTime: 74, delayed: 21, cancelled: 5, color: D.green },
    { name: 'Vistara', onTime: 79, delayed: 17, cancelled: 4, color: '#818cf8' },
    { name: 'AirAsia', onTime: 76, delayed: 19, cancelled: 5, color: '#38bdf8' },
];

const DELAY_CAUSES = [
    { cause: 'Weather Conditions', pct: 28, color: D.blue, icon: '🌧️' },
    { cause: 'Technical / Maintenance', pct: 22, color: D.red, icon: '🔧' },
    { cause: 'Late Aircraft', pct: 31, color: D.orange, icon: '✈️' },
    { cause: 'Air Traffic Control', pct: 12, color: '#818cf8', icon: '🛫' },
    { cause: 'Security', pct: 4, color: D.green, icon: '🔒' },
    { cause: 'Other', pct: 3, color: D.textSec, icon: '❓' },
];

const MONTHLY = [
    { month: 'Jan', delays: 62 }, { month: 'Feb', delays: 45 },
    { month: 'Mar', delays: 40 }, { month: 'Apr', delays: 48 },
    { month: 'May', delays: 71 }, { month: 'Jun', delays: 88 },
    { month: 'Jul', delays: 95 }, { month: 'Aug', delays: 90 },
    { month: 'Sep', delays: 78 }, { month: 'Oct', delays: 52 },
    { month: 'Nov', delays: 55 }, { month: 'Dec', delays: 68 },
];

const HIGH_RISK_ROUTES = [
    { route: 'DEL → GOI', riskScore: 74, reason: 'Monsoon corridor', trend: '↑' },
    { route: 'BOM → DEL', riskScore: 68, reason: 'High traffic volume', trend: '→' },
    { route: 'DEL → LEH', riskScore: 82, reason: 'Mountain weather', trend: '↑' },
    { route: 'CCU → GAU', riskScore: 71, reason: 'Fog & terrain', trend: '↑' },
    { route: 'BLR → MAA', riskScore: 55, reason: 'Thunderstorms', trend: '↓' },
    { route: 'BOM → COK', riskScore: 60, reason: 'Monsoon winds', trend: '→' },
];

// This component renders the stat card view.
function StatCard({ label, value, sub, color, icon }) {
    return (
        <div style={{
            background: D.card,
            border: `1px solid ${D.border}`,
            borderRadius: '10px', padding: '22px',
            display: 'flex', alignItems: 'center', gap: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,196,0,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = D.border}
        >
            <div style={{
                width: 52, height: 52, borderRadius: '10px', fontSize: 25,
                background: `${color}1A`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{icon}</div>
            <div>
                <div style={{ color: D.textSec, fontSize: 15, marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ color: D.textPri, fontSize: 29, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>{value}</div>
                {sub && <div style={{ color: color, fontSize: 15, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
            </div>
        </div>
    );
}

// This component renders the analytics view.
export default function Analytics() {
    const maxBar = Math.max(...MONTHLY.map(m => m.delays));

    return (
        <div style={{ paddingBottom: 60, background: D.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Page header */}
            <section style={{ padding: '40px 0 28px', textAlign: 'center', background: 'transparent', borderBottom: `1px solid ${D.border}` }}>
                <div className="container">
                    <h1 style={{ color: D.accent, fontSize: 35, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.04em' }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ color: D.textSec, fontSize: 18 }}>
                        Historical delay patterns, airline performance & route risk analysis
                    </p>
                </div>
            </section>

            <div className="container" style={{ paddingTop: 24 }}>

                {/* Summary stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
                    <StatCard label="Avg On-Time Rate" value="75.3%" sub="↑ 2.1% vs last year" color={D.green} icon="✅" />
                    <StatCard label="Avg Delay (mins)" value="38 min" sub="Peak: July–August" color={D.orange} icon="⏱️" />
                    <StatCard label="Cancel Rate" value="5.8%" sub="↓ 0.3% improvement" color={D.red} icon="🚫" />
                    <StatCard label="Routes Tracked" value="1,240" sub="Domestic India" color={D.accent} icon="🗺️" />
                </div>

                {/* Monthly delay trend */}
                <div style={cardStyle}>
                    <h2 style={sectionTitle}>Monthly Delay Index — India Aviation (2023-24)</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, marginTop: 16 }}>
                        {MONTHLY.map(m => (
                            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontSize: 14, color: D.textSec, fontWeight: 600 }}>{m.delays}</div>
                                <div style={{
                                    width: '100%', borderRadius: '4px 4px 0 0',
                                    height: `${(m.delays / maxBar) * 140}px`,
                                    background: m.delays >= 85 ? D.red : m.delays >= 65 ? D.orange : D.blue,
                                    transition: 'height 0.3s ease',
                                    boxShadow: `0 0 10px ${m.delays >= 85 ? D.red : m.delays >= 65 ? D.orange : D.blue}40`
                                }} />
                                <div style={{ fontSize: 14, color: D.textMut, fontWeight: 500 }}>{m.month}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', paddingTop: 16, borderTop: `1px solid ${D.border}` }}>
                        <LegendDot color={D.blue} label="Normal" />
                        <LegendDot color={D.orange} label="Elevated" />
                        <LegendDot color={D.red} label="Peak disruption (Monsoon)" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20, marginTop: 20 }}>
                    {/* Delay causes */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}>Delay Causes Breakdown</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                            {DELAY_CAUSES.map(d => (
                                <div key={d.cause}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ color: D.textSec, fontSize: 16, fontWeight: 500 }}>{d.icon} {d.cause}</span>
                                        <span style={{ color: d.color, fontWeight: 700, fontSize: 16 }}>{d.pct}%</span>
                                    </div>
                                    <div style={{ background: D.cardAlt, borderRadius: 4, height: 8 }}>
                                        <div style={{
                                            width: `${d.pct}%`, height: 8, borderRadius: 4,
                                            background: d.color,
                                            boxShadow: `0 0 8px ${d.color}80`
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* High risk routes */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitle}>Highest Risk Routes</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                            {HIGH_RISK_ROUTES.map(r => (
                                <div key={r.route} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 16px', borderRadius: 8,
                                    background: D.cardAlt,
                                    border: `1px solid ${D.border}`,
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,196,0,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.cardAlt }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: D.textPri, fontWeight: 800, fontSize: 17 }}>{r.route}</div>
                                        <div style={{ color: D.textSec, fontSize: 16, marginTop: 2 }}>{r.reason}</div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: 4, fontSize: 16, fontWeight: 700,
                                        background: r.riskScore >= 75 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                        color: r.riskScore >= 75 ? D.red : D.orange,
                                        border: `1px solid ${r.riskScore >= 75 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    }}>
                                        {r.riskScore}/100 {r.trend}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Airline performance table */}
                <div style={{ ...cardStyle, marginTop: 20 }}>
                    <h2 style={sectionTitle}>Airline Performance Rankings</h2>
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${D.border}`, background: D.cardAlt }}>
                                    {['Rank', 'Airline', 'On-Time %', 'Delayed %', 'Cancelled %', 'Rating'].map(h => (
                                        <th key={h} style={{ color: D.textSec, fontSize: 15, padding: '12px 16px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...AIRLINE_STATS].sort((a, b) => b.onTime - a.onTime).map((a, i) => (
                                    <tr key={a.name} style={{ borderBottom: `1px solid ${D.border}`, transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '16px', color: D.textMut, fontSize: 17, fontWeight: 700 }}>#{i + 1}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ color: a.color, fontWeight: 700, textShadow: `0 0 10px ${a.color}80` }}>●</span>
                                            <span style={{ color: D.textPri, marginLeft: 8, fontWeight: 700 }}>{a.name}</span>
                                        </td>
                                        <td style={{ padding: '16px', color: D.green, fontWeight: 800 }}>{a.onTime}%</td>
                                        <td style={{ padding: '16px', color: D.orange, fontWeight: 700 }}>{a.delayed}%</td>
                                        <td style={{ padding: '16px', color: D.red, fontWeight: 700 }}>{a.cancelled}%</td>
                                        <td style={{ padding: '16px', fontSize: 17 }}>
                                            <span style={{ filter: 'drop-shadow(0 0 4px rgba(245,196,0,0.4))' }}>
                                                {'⭐'.repeat(a.onTime >= 80 ? 5 : a.onTime >= 70 ? 4 : 3)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// This component renders the legend dot view.
function LegendDot({ color, label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}80` }} />
            <span style={{ color: D.textSec, fontSize: 16, fontWeight: 600 }}>{label}</span>
        </div>
    );
}

const cardStyle = {
    background: D.card,
    border: `1px solid ${D.border}`,
    borderRadius: 12, padding: 28,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
};

const sectionTitle = {
    color: D.textPri, fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em',
};
