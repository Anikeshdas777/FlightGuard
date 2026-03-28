import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function About() {
    const { t } = useLanguage();

    return (
        <div className="about-page" style={{ paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
            {/* Elegant Header Area */}
            <div style={{
                background: 'radial-gradient(ellipse at top, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)',
                padding: '100px 20px 80px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    FlightGuard Enterprise
                </div>
                <h1 style={{
                    fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem',
                    color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.1
                }}>
                    {t('aboutTitle')}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
                    {t('aboutSubtitle')}
                </p>
            </div>

            <div className="container" style={{ marginTop: '-20px' }}>
                
                {/* Data Sources Trust Band */}
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap',
                    padding: '2rem 0', marginBottom: '4rem', opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>POWERED BY</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontWeight: 600, fontSize: '1.1rem' }}>☁️ <span style={{ letterSpacing: '1px' }}>OpenWeather</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontWeight: 600, fontSize: '1.1rem' }}>📡 <span style={{ letterSpacing: '1px' }}>AviationStack</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontWeight: 600, fontSize: '1.1rem' }}>🧠 <span style={{ letterSpacing: '1px' }}>Deep Learning Engine</span></div>
                </div>

                {/* Visual Story Section - Frosted Glass Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    
                    {/* The Problem */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0',
                        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', borderRadius: '24px',
                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span> THE PROBLEM
                            </div>
                            <h2 style={{ color: '#f8fafc', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
                                Unpredictable Delays Cost Time and Money
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                {t('aboutProblem')}
                            </p>
                        </div>
                        <div style={{ minHeight: '350px', position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,0.8) 0%, transparent 100%)', zIndex: 1 }}></div>
                            <img src="/images/problem.png" alt="Traveler checking delayed flight" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                        </div>
                    </div>

                    {/* The Solution */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0',
                        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', borderRadius: '24px',
                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)', direction: 'rtl'
                    }}>
                        <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', direction: 'ltr' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.1em' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span> THE SOLUTION
                            </div>
                            <h2 style={{ color: '#f8fafc', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
                                AI-Powered Foresight
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8 }}>
                                {t('aboutSolution')}
                            </p>
                        </div>
                        <div style={{ minHeight: '350px', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.05)', direction: 'ltr' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(15,23,42,0.8) 0%, transparent 100%)', zIndex: 1 }}></div>
                            <img src="/images/solution.png" alt="AI Flight Prediction Interface" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                        </div>
                    </div>
                </div>

                {/* Professional Steps Layout */}
                <div style={{ marginTop: '6rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
                            {t('aboutStepsTitle')}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>A seamless implementation process designed for precision and actionable insights.</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {/* Step 1 */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                    1
                                </div>
                                <h3 style={{ color: '#f0f0f0', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                                    {t('aboutStep1Title')}
                                </h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                                {t('aboutStep1Desc')}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                    2
                                </div>
                                <h3 style={{ color: '#f0f0f0', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                                    {t('aboutStep2Title')}
                                </h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                                {t('aboutStep2Desc')}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                    3
                                </div>
                                <h3 style={{ color: '#f0f0f0', fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                                    {t('aboutStep3Title')}
                                </h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                                {t('aboutStep3Desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
