import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Remove static NAV_ITEMS array since we need dynamic translations
// We'll define them inside the component now.

function Header({ currentPage, onNavigate }) {
    const { user, logout } = useAuth();
    const { t, lang, toggleLanguage, changeLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const initial = user?.name?.charAt(0).toUpperCase() || '?';

    const NAV_ITEMS = [
        { id: 'dashboard', label: t('dashboard') },
        { id: 'livetracker', label: t('liveTracker') },
        { id: 'heatmap', label: t('heatmap') },
        { id: 'analytics', label: t('analytics') },
        { id: 'alerts', label: t('alerts') },
        { id: 'about', label: t('about') },
    ];

    return (
        <header className="header glass-header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
            <div className="container">
                <div className="nav-content">
                    <div className="logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                                fill="currentColor"
                            />
                        </svg>
                        <h2>FlightGuard</h2>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171', fontSize: '0.8rem', fontWeight: 800,
                            padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginLeft: '4px',
                            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)' }} />
                            {t('live')}
                        </span>
                    </div>

                    <nav className="nav-links">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                id={item.id === 'alerts' ? 'tour-step-3' : undefined}
                                onClick={() => onNavigate(item.id)}
                                className={`nav-link${currentPage === item.id ? ' active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                        {/* Removed Theme Switcher per user request */}

                        {/* Language Dropdown Button */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setLangMenuOpen(o => !o)} style={{
                                background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.15)',
                                color: '#f0f0f0', padding: '6px 12px', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '1rem', fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>🌐</span> {lang.toUpperCase()}
                            </button>
                            {langMenuOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                    background: '#1a1a1a', borderRadius: '12px', minWidth: '150px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                                    zIndex: 1000, overflow: 'hidden', padding: '6px'
                                }}>
                                    {[
                                        { code: 'en', label: 'English' },
                                        { code: 'hi', label: 'हिन्दी (Hindi)' },
                                        { code: 'ta', label: 'தமிழ் (Tamil)' },
                                        { code: 'te', label: 'తెలుగు (Telugu)' },
                                        { code: 'sa', label: 'संस्कृतम् (Sanskrit)' },
                                        { code: 'ur', label: 'اردو (Urdu)' },
                                    ].map(l => (
                                        <button
                                            key={l.code}
                                            onClick={() => { changeLanguage(l.code); setLangMenuOpen(false); }}
                                            style={{
                                                width: '100%', padding: '10px 14px', border: 'none',
                                                background: lang === l.code ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                textAlign: 'left', cursor: 'pointer',
                                                color: lang === l.code ? 'white' : '#cbd5e1',
                                                fontSize: '1rem', fontWeight: lang === l.code ? 700 : 500,
                                                borderRadius: '6px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                            onMouseOut={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {langMenuOpen && <div onClick={() => setLangMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />}
                        </div>

                        {/* User Avatar / Sign In */}
                        <div style={{ position: 'relative' }}>
                            {user ? (
                                <>
                                    <button onClick={() => setMenuOpen(o => !o)} style={{
                                        width: '38px', height: '38px', borderRadius: '50%', border: 'none',
                                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        color: 'white', fontWeight: 800, fontSize: '1.15rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'transform 0.2s',
                                        boxShadow: '0 0 0 2px rgba(99,102,241,0.4)',
                                    }}>
                                        {initial}
                                    </button>
                                    {menuOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                            background: '#1e1e1e', borderRadius: '12px', minWidth: '200px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                            zIndex: 1000, overflow: 'hidden',
                                        }}>
                                            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontWeight: 700, color: '#f0f0f0', fontSize: '1.1rem' }}>{user.name}</div>
                                                <div style={{ color: '#999', fontSize: '0.95rem' }}>{user.email}</div>
                                            </div>
                                            <button onClick={() => { onNavigate('profile'); setMenuOpen(false); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#ccc', fontSize: '1.07rem', fontWeight: 500 }}>
                                                {t('myProfile')}
                                            </button>
                                            <button onClick={() => { logout(); setMenuOpen(false); }} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444', fontSize: '1.07rem', fontWeight: 600 }}>
                                                {t('signOut')}
                                            </button>
                                        </div>
                                    )}
                                    {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />}
                                </>
                            ) : (
                                <button onClick={() => onNavigate('auth')} style={{
                                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                                    background: 'rgba(59,130,246,0.15)', color: '#93c5fd', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '1.05rem',
                                }}>
                                    {t('signIn')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
