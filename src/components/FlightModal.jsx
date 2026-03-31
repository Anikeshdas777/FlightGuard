// This file shows detailed information for a selected flight.
import React, { useEffect } from 'react';
import { formatTime } from '../utils/flightUtils.js';

// This component renders the flight modal view.
function FlightModal({ flight, onClose }) {
    useEffect(() => {
        // This function handles handle key.
        function handleKey(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!flight) return null;

    const riskColorVar =
        flight.riskLevel === 'low'
            ? 'var(--risk-low)'
            : flight.riskLevel === 'medium'
                ? 'var(--risk-medium)'
                : flight.riskLevel === 'high'
                    ? 'var(--risk-high)'
                    : 'var(--risk-critical)';

    return (
        <div className="modal active" id="flightModal">
            <div className="modal-backdrop" id="modalBackdrop" onClick={onClose}></div>
            <div className="modal-content">
                <button className="modal-close" id="modalClose" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
                <div id="modalBody">
                    {/* Header Row */}
                    <h2 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.95rem' }}>{flight.flightNumber}</span>
                        <span className={`risk-badge ${flight.riskLevel}`}>{flight.riskLevel} Risk</span>
                    </h2>

                    {/* Route */}
                    <div style={{ background: 'var(--bg-elevated)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>From</div>
                                <div style={{ fontSize: '1.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{flight.origin.code}</div>
                                <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>{flight.origin.city}</div>
                            </div>
                            <div style={{ fontSize: '1.7rem', color: 'var(--text-muted)' }}>→</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>To</div>
                                <div style={{ fontSize: '1.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{flight.destination.code}</div>
                                <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>{flight.destination.city}</div>
                            </div>
                        </div>
                    </div>

                    {/* Flight Info */}
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.3rem' }}>Flight Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Airline</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.airline}</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Departure Time</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{formatTime(flight.departureTime)}</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Gate</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.gate}</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Terminal</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>T{flight.terminal}</div></div>
                    </div>

                    {/* Risk Score */}
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.3rem' }}>Delay Prediction Analysis</h3>
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.2rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--risk-critical)', marginBottom: '1.2rem' }}>
                        <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Risk Score</div>
                        <div style={{ fontSize: '1.95rem', fontWeight: 800, color: 'var(--risk-critical)', margin: '0.5rem 0' }}>{flight.riskScore}/100</div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${flight.riskScore}%`, height: '100%', background: riskColorVar }}></div>
                        </div>
                    </div>

                    {/* Predicted Delay */}
                    {flight.predictedDelay > 0 && (
                        <div style={{ background: 'rgba(245, 196, 0, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 196, 0, 0.3)', marginBottom: '1.2rem' }}>
                            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Predicted Delay</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning-color)' }}>{flight.predictedDelay} minutes</div>
                        </div>
                    )}

                    {/* Factors */}
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.3rem' }}>Contributing Factors</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        {flight.factors.map((factor, i) => (
                            <span key={i} style={{ padding: '6px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                                {factor}
                            </span>
                        ))}
                    </div>

                    {/* Weather */}
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.3rem' }}>Weather Conditions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Condition</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.weather.condition}</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Temperature</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.weather.temperature}°C</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Visibility</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.weather.visibility} mi</div></div>
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4px' }}>Wind Speed</div><div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem' }}>{flight.weather.windSpeed} mph</div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FlightModal;
