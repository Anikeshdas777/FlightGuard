// This file shows the signed-in user profile page.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    getSavedRoutes, removeRoute,
    getTravelHistory,
    getPreferences, savePreferences,
} from '../utils/authService.js';
import { AIRPORTS, AIRLINES } from '../data/constants.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const AIRLINE_LIST = typeof AIRLINES !== 'undefined' ? AIRLINES : ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air', 'GoAir'];

// This component renders the risk badge view.
function RiskBadge({ level }) {
    const styles = {
        low: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
        medium: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' },
        high: { bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' },
        critical: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
    };
    const s = styles[level] || styles.low;
    return (
        <span style={{ fontSize: '0.9rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em', background: s.bg, color: s.color, border: s.border }}>
            {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : level === 'high' ? 'High' : 'Critical'}
        </span>
    );
}

// This component renders the profile page view.
export default function ProfilePage({ onNavigate }) {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('routes');
    const [routes, setRoutes] = useState([]);
    const [history, setHistory] = useState([]);
    const [prefs, setPrefs] = useState({ homeAirport: '', favoriteAirlines: [] });
    const [prefsSaved, setPrefsSaved] = useState(false);

    useEffect(() => {
        if (!user) return;
        setRoutes(getSavedRoutes(user.uid));
        setHistory(getTravelHistory(user.uid));
        setPrefs(getPreferences(user.uid) || { homeAirport: '', favoriteAirlines: [] });
    }, [user]);

    // This function handles handle delete route.
    const handleDeleteRoute = (id) => {
        removeRoute(user.uid, id);
        setRoutes(getSavedRoutes(user.uid));
    };

    // This function handles toggle airline.
    const toggleAirline = (airline) => {
        setPrefs(p => {
            const favs = p.favoriteAirlines || [];
            return {
                ...p,
                favoriteAirlines: favs.includes(airline) ? favs.filter(a => a !== airline) : [...favs, airline],
            };
        });
        setPrefsSaved(false);
    };

    // This function handles handle save prefs.
    const handleSavePrefs = () => {
        savePreferences(user.uid, prefs);
        setPrefsSaved(true);
        setTimeout(() => setPrefsSaved(false), 2500);
    };

    const card = { background: '#1e1e1e', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' };

    const tabs = [
        { id: 'routes', label: t('savedRoutesTab') },
        { id: 'history', label: t('travelHistory') },
        { id: 'settings', label: t('preferences') },
    ];

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.95rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'white', margin: 0 }}>{t('welcomeBack')}, {user?.name?.split(' ')[0]}! 👋</h2>
                        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '1.07rem' }}>{user?.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => onNavigate('dashboard')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', cursor: 'pointer', fontWeight: 600, fontSize: '1.07rem' }}>
                        {t('dashboardBtn')}
                    </button>
                    <button onClick={logout} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: '1.07rem' }}>
                        {t('signOut')}
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: t('savedRoutes'), value: routes.length, icon: '⭐', color: '#f59e0b' },
                    { label: t('flightsAnalyzed'), value: history.length, icon: '🔍', color: 'var(--accent-primary)' },
                    { label: t('alertsTriggered'), value: history.filter(h => h.riskLevel === 'high' || h.riskLevel === 'critical').length, icon: '⚠️', color: '#ef4444' },
                    { label: t('onTimePredictions'), value: history.filter(h => h.riskLevel === 'low').length, icon: '✅', color: '#22c55e' },
                ].map(stat => (
                    <div key={stat.label} style={{ background: '#1e1e1e', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.95rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.95rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: '0.95rem', color: '#999999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#1a1a1a', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '1.07rem', fontWeight: 600, transition: 'all 0.2s',
                        background: activeTab === t.id ? 'rgba(245,196,0,0.12)' : 'transparent',
                        color: activeTab === t.id ? '#F5C400' : '#999999',
                        boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}

            {/* ─── Saved Routes ─── */}
            {activeTab === 'routes' && (
                <div>
                    {routes.length === 0 ? (
                        <div style={{ background: '#1e1e1e', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>⭐</div>
                            <h3 style={{ color: '#f0f0f0', marginBottom: '0.5rem' }}>{t('noSavedRoutes')}</h3>
                            <p style={{ color: '#999999', fontSize: '1.07rem' }}>{t('noSavedRoutesHint')}</p>
                        </div>
                    ) : routes.map(route => (
                        <div key={route.id} style={{ ...card, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.7rem' }}>✈️</div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1.25rem' }}>
                                        {route.from} <span style={{ color: '#999999', fontWeight: 400 }}>→</span> {route.to}
                                    </div>
                                    <div style={{ color: '#999999', fontSize: '1rem' }}>
                                        {route.airline && <span>{route.airline} · </span>}
                                        {t('saved')} {new Date(route.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => onNavigate('livetracker')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--accent-primary)', background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
                                    {t('track')}
                                </button>
                                <button onClick={() => handleDeleteRoute(route.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Travel History ─── */}
            {activeTab === 'history' && (
                <div>
                    {history.length === 0 ? (
                        <div style={{ background: '#1e1e1e', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>📋</div>
                            <h3 style={{ color: '#f0f0f0', marginBottom: '0.5rem' }}>{t('noHistory')}</h3>
                            <p style={{ color: '#999999', fontSize: '1.07rem' }}>{t('noHistoryHint')}</p>
                        </div>
                    ) : history.map((entry, i) => (
                        <div key={entry.id || i} style={{ ...card }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📊</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: '#f0f0f0' }}>
                                    {entry.airline} {entry.flightNumber && `· ${entry.flightNumber}`}
                                </div>
                                <div style={{ color: '#999999', fontSize: '1rem' }}>
                                    {entry.origin && entry.destination && `${entry.origin} → ${entry.destination} · `}
                                    {new Date(entry.loggedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <RiskBadge level={entry.riskLevel} />
                                {entry.predictedDelay != null && (
                                    <span style={{ fontSize: '0.95rem', color: '#999999' }}>~{entry.predictedDelay} min delay</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Preferences ─── */}
            {activeTab === 'settings' && (
                <div style={{ background: '#1e1e1e', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '1.5rem' }}>{t('yourSettings')}</h3>

                    {/* Home Airport */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#c0c0c0', fontSize: '1.07rem', marginBottom: '0.5rem' }}>{t('homeAirport')}</label>
                        <select value={prefs.homeAirport} onChange={e => { setPrefs(p => ({ ...p, homeAirport: e.target.value })); setPrefsSaved(false); }} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '1.1rem', color: '#f0f0f0', background: '#282828', minWidth: '250px' }}>
                            <option value="">{t('selectHomeAirport')}</option>
                            {(AIRPORTS || []).map(a => (
                                <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Favorite Airlines */}
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, color: '#c0c0c0', fontSize: '1.07rem', marginBottom: '0.75rem' }}>{t('favAirlines')}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {AIRLINE_LIST.map(airline => {
                                // This function handles selected.
                                const selected = (prefs.favoriteAirlines || []).includes(airline);
                                return (
                                    <button key={airline} onClick={() => toggleAirline(airline)} style={{
                                        padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 600, transition: 'all 0.15s',
                                        border: selected ? '1px solid #F5C400' : '1px solid rgba(255,255,255,0.12)',
                                        background: selected ? 'rgba(245,196,0,0.12)' : 'rgba(255,255,255,0.05)',
                                        color: selected ? '#F5C400' : '#c0c0c0',
                                    }}>
                                        {selected ? '✓ ' : ''}{airline}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={handleSavePrefs} style={{ padding: '11px 28px', borderRadius: '10px', border: 'none', background: prefsSaved ? 'rgba(34,197,94,0.9)' : 'linear-gradient(135deg, #F5C400, #FFD740)', color: '#111111', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.3s' }}>
                        {prefsSaved ? t('prefsSaved') : t('savePreferences')}
                    </button>
                </div>
            )}
        </div>
    );
}
