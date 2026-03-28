import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AuthPage() {
    const { t } = useLanguage();
    const [tab, setTab] = useState('login'); // 'login' | 'signup'
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (tab === 'signup') {
                if (!form.name.trim()) { setError('Please enter your name.'); return; }
                if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
                const res = await register(form.name, form.email, form.password);
                if (res.error) setError(res.error);
            } else {
                const res = await login(form.email, form.password);
                if (res.error) setError(res.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
        color: '#e2e8f0', fontSize: '1.15rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };
    const labelStyle = {
        display: 'block', fontSize: '1rem', fontWeight: 600, color: '#94a3b8',
        marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", padding: '2rem',
        }}>
            {/* Background decorative orbs */}
            <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-transparent) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{
                width: '100%', maxWidth: '440px',
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden',
            }}>
                {/* Logo Header */}
                <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px' }}>✈️</div>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlightGuard</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '1.07rem', margin: 0 }}>Flight Delay Prediction & Analysis</p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', margin: '1.5rem 2rem 0', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
                    {['login', 'signup'].map(tabName => (
                        <button key={tabName} onClick={() => { setTab(tabName); setError(''); }} style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                            fontSize: '1.07rem', fontWeight: 600, transition: 'all 0.2s',
                            background: tab === tabName ? 'rgba(var(--accent-rgb), 0.9)' : 'transparent',
                            color: tab === tabName ? '#fff' : '#64748b',
                        }}>
                            {tabName === 'login' ? t('signIn') : t('createAccount')}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tab === 'signup' && (
                        <div>
                            <label style={labelStyle}>{t('fullName')}</label>
                            <input style={inputStyle} type="text" placeholder="e.g. Sounak Datta" value={form.name} onChange={set('name')} required />
                        </div>
                    )}
                    <div>
                        <label style={labelStyle}>{t('emailAddress')}</label>
                        <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    </div>
                    <div>
                        <label style={labelStyle}>{t('password')}</label>
                        <input style={inputStyle} type="password" placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Your password'} value={form.password} onChange={set('password')} required />
                    </div>
                    {tab === 'signup' && (
                        <div>
                            <label style={labelStyle}>{t('confirmPassword')}</label>
                            <input style={inputStyle} type="password" placeholder="Repeat your password" value={form.confirm} onChange={set('confirm')} required />
                        </div>
                    )}

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '1.07rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                        background: loading ? 'rgba(var(--accent-rgb), 0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        color: '#fff', fontSize: '1.15rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)',
                        marginTop: '0.25rem',
                    }}>
                        {loading ? '...' : tab === 'login' ? `🚀 ${t('signIn')}` : `✨ ${t('createAccountBtn')}`}
                    </button>

                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {tab === 'login' ? `${t('noAccount')} ` : `${t('haveAccount')} `}
                        <button type="button" onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                            {tab === 'login' ? t('signUpFree') : t('signIn')}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
