// This file shows the live flight tracking page.
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLiveFlights } from '../utils/airlabsApi.js';

// Dark theme tokens
const D = {
    bg: '#111111',
    card: '#1e1e1e',
    cardAlt: '#181818',
    inner: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.07)',
    accent: '#F5C400',
    textPri: '#f0f0f0',
    textSec: '#a0a0a0',
    textMut: '#666666',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#60a5fa',
    orange: '#f59e0b',
};

// Airport code → city name lookup
const CITY_NAMES = {
    DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', MAA: 'Chennai',
    CCU: 'Kolkata', HYD: 'Hyderabad', COK: 'Kochi', AMD: 'Ahmedabad',
    PNQ: 'Pune', GOI: 'Goa', JAI: 'Jaipur', GAU: 'Guwahati',
    IXC: 'Chandigarh', TRV: 'Trivandrum', VNS: 'Varanasi',
    LEH: 'Leh', IXB: 'Bagdogra', ATQ: 'Amritsar', NAG: 'Nagpur',
    BHO: 'Bhopal', IDR: 'Indore', BBI: 'Bhubaneswar', PAT: 'Patna',
    LKO: 'Lucknow', IXR: 'Ranchi', SXR: 'Srinagar', UDR: 'Udaipur',
    JDH: 'Jodhpur', JSA: 'Jaisalmer', RPR: 'Raipur', VTZ: 'Vizag',
    IXM: 'Madurai', IXE: 'Mangalore', CNN: 'Kannur',
};

// This component renders the live tracker view.
function LiveTracker({ news = [] }) {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMocking, setIsMocking] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const [searchParams, setSearchParams] = useState({
        dep_iata: 'DEL',
        arr_iata: '',
        airline_name: '',
        flight_iata: ''
    });

    // This function handles handle search.
    const handleSearch = useCallback(async () => {
        if (!searchParams.dep_iata && !searchParams.flight_iata) {
            setError("Please enter a Departure Airport (e.g., DEL) or a Flight Number.");
            return;
        }
        setLoading(true);
        setError(null);
        const result = await fetchLiveFlights(searchParams);
        if (result.error && !result.usingMock) {
            setError(result.error);
        } else {
            setFlights(result.data);
            setIsMocking(result.usingMock);
            setLastUpdated(new Date());
            if (result.error) {
                setError(`API Error: ${result.error}. Displaying demo data instead.`);
            }
        }
        setLoading(false);
    }, [searchParams]);

    useEffect(() => { handleSearch(); }, []); // eslint-disable-line

    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => { handleSearch(); }, 60000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, handleSearch]);

    const activeCount = flights.filter(f => f.status === 'active').length;
    const delayedCount = flights.filter(f => f.actualDelay > 15).length;

    // This function handles get status style.
    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return { bg: 'rgba(34,197,94,0.12)', color: D.green, border: 'rgba(34,197,94,0.25)', label: '🟢 ACTIVE' };
            case 'landed': return { bg: 'rgba(96,165,250,0.12)', color: D.blue, border: 'rgba(96,165,250,0.25)', label: '🔵 LANDED' };
            case 'cancelled': return { bg: 'rgba(239,68,68,0.12)', color: D.red, border: 'rgba(239,68,68,0.25)', label: '🔴 CANCELLED' };
            case 'scheduled': return { bg: 'rgba(245,158,11,0.12)', color: D.orange, border: 'rgba(245,158,11,0.25)', label: '🟡 SCHEDULED' };
            case 'diverted': return { bg: 'rgba(249,115,22,0.12)', color: '#f97316', border: 'rgba(249,115,22,0.25)', label: '🟠 DIVERTED' };
            default: return { bg: D.inner, color: D.textSec, border: D.border, label: status.toUpperCase() };
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        background: D.inner,
        border: `1px solid ${D.border}`,
        borderRadius: '6px',
        color: D.textPri,
        fontFamily: 'Inter, sans-serif',
        fontSize: '1.07rem',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: D.textSec,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    };

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '80vh', background: D.bg }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Left Column - Main Content */}
                <div style={{ flex: '1 1 700px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Search Controls */}
                    <div style={{
                        background: D.card,
                        padding: '1.5rem',
                        borderRadius: '10px',
                        border: `1px solid ${D.border}`,
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Dep. Airport (IATA)</label>
                                <input type="text" value={searchParams.dep_iata}
                                    onChange={e => setSearchParams({ ...searchParams, dep_iata: e.target.value.toUpperCase() })}
                                    placeholder="e.g. DEL" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Arr. Airport (IATA)</label>
                                <input type="text" value={searchParams.arr_iata}
                                    onChange={e => setSearchParams({ ...searchParams, arr_iata: e.target.value.toUpperCase() })}
                                    placeholder="Optional" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Airline (IATA)</label>
                                <input type="text" value={searchParams.airline_name}
                                    onChange={e => setSearchParams({ ...searchParams, airline_name: e.target.value.toUpperCase() })}
                                    placeholder="e.g. 6E" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Flight Number</label>
                                <input type="text" value={searchParams.flight_iata}
                                    onChange={e => setSearchParams({ ...searchParams, flight_iata: e.target.value.toUpperCase() })}
                                    placeholder="e.g. 6E302" style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button onClick={handleSearch} disabled={loading} style={{
                                    padding: '10px 24px',
                                    background: loading ? 'rgba(245,196,0,0.5)' : D.accent,
                                    color: '#111111',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '1.07rem',
                                    transition: 'all 0.2s',
                                    boxShadow: loading ? 'none' : '0 0 16px rgba(245,196,0,0.25)',
                                }}>
                                    {loading ? '🔄 Searching...' : '✈ Track Flights'}
                                </button>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: D.textSec, fontWeight: 500, fontSize: '1.07rem' }}>
                                    <input type="checkbox" checked={autoRefresh}
                                        onChange={e => setAutoRefresh(e.target.checked)}
                                        style={{ accentColor: D.accent }} />
                                    Auto-refresh (60s)
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                {[
                                    { val: flights.length, label: 'Tracked', color: D.textPri },
                                    { val: activeCount, label: 'Active', color: D.green },
                                    { val: delayedCount, label: 'Delayed', color: D.orange },
                                ].map(({ val, label, color }) => (
                                    <div key={label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                                        <div style={{ fontSize: '0.88rem', color: D.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error / Warning Banner */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171',
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            fontSize: '1.07rem',
                        }}>
                            <strong>Notice:</strong> {error}
                        </div>
                    )}

                    {/* Live Board Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.45rem', color: D.textPri, fontWeight: 800, margin: 0 }}>Live Board</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', color: D.textMut }}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                background: isMocking ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                                color: isMocking ? D.orange : D.green,
                                border: `1px solid ${isMocking ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                            }}>
                                {isMocking ? '⚠️ DEMO DATA' : '📡 LIVE API DATA'}
                            </span>
                        </div>
                    </div>

                    {/* Flights List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {flights.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center', padding: '4rem',
                                background: D.card, borderRadius: '10px',
                                color: D.textSec, border: `1px solid ${D.border}`,
                            }}>
                                No flights found matching your criteria.
                            </div>
                        ) : loading ? (
                            <div style={{
                                textAlign: 'center', padding: '4rem',
                                background: D.card, borderRadius: '10px',
                                color: D.accent, border: `1px solid ${D.border}`,
                                fontSize: '1.2rem', fontWeight: 600,
                            }}>
                                <div style={{ animation: 'livePulse 1s infinite alternate' }}>Fetching live data...</div>
                            </div>
                        ) : (
                            flights.map(flight => {
                                const sStyle = getStatusStyle(flight.status);
                                const delayDiff = Math.abs(flight.actualDelay - flight.predictedDelay);
                                const isAccurate = delayDiff <= 15;

                                return (
                                    <div key={flight.id} style={{
                                        background: D.card,
                                        border: `1px solid ${D.border}`,
                                        borderRadius: '10px',
                                        padding: '1.25rem 1.5rem',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '1.5rem',
                                        alignItems: 'center',
                                        transition: 'border-color 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,196,0,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = D.border}
                                    >
                                        {/* Airline & Flight */}
                                        <div style={{ flex: '1', minWidth: '140px' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: D.textPri, letterSpacing: '-0.02em' }}>{flight.flightNumber}</div>
                                            <div style={{ color: D.textSec, fontSize: '1rem', marginBottom: '0.5rem' }}>{flight.airline}</div>
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '5px', fontSize: '0.85rem',
                                                fontWeight: 700, background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}`,
                                            }}>
                                                {sStyle.label}
                                            </span>
                                        </div>

                                        {/* Route */}
                                        <div style={{
                                            flex: '2', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            minWidth: '200px', background: D.inner, padding: '0.875rem 1rem', borderRadius: '8px',
                                            border: `1px solid ${D.border}`,
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: D.textPri, letterSpacing: '-0.03em' }}>{flight.origin.code}</div>
                                                <div style={{ fontSize: '0.78rem', color: D.accent, fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px' }}>{CITY_NAMES[flight.origin.code] || ''}</div>
                                                <div style={{ fontSize: '0.9rem', color: D.textSec, marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div>Sch: {flight.scheduledDateDisplay} <span style={{ fontWeight: 600, color: D.textPri }}>{flight.scheduledTimeDisplay}</span></div>
                                                    {flight.actualTimeDisplay && (
                                                        <div style={{ color: flight.actualDelay > 15 ? D.red : D.textSec }}>
                                                            Act: {flight.actualDateDisplay} <span style={{ fontWeight: 600 }}>{flight.actualTimeDisplay}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div style={{ color: D.textMut, flex: 1, textAlign: 'center', position: 'relative' }}>
                                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '100%', position: 'absolute', top: '50%', zIndex: 1 }}></div>
                                                <span style={{ position: 'relative', zIndex: 2, background: D.inner, padding: '0 10px', fontSize: '1.3rem', color: D.accent }}>✈</span>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: D.textPri, letterSpacing: '-0.03em' }}>{flight.destination.code}</div>
                                                <div style={{ fontSize: '0.78rem', color: D.accent, fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px' }}>{CITY_NAMES[flight.destination.code] || ''}</div>
                                            </div>
                                        </div>

                                        {/* Delays Comparison */}
                                        <div style={{ flex: '2', display: 'flex', gap: '0.75rem', minWidth: '220px' }}>
                                            <div style={{
                                                flex: 1, padding: '0.75rem 1rem',
                                                background: D.inner, borderRadius: '8px',
                                                borderLeft: `3px solid ${flight.actualDelay > 15 ? D.red : D.green}`,
                                                border: `1px solid ${D.border}`,
                                            }}>
                                                <div style={{ fontSize: '0.85rem', color: D.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Actual Delay</div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: flight.actualDelay > 15 ? D.red : D.green }}>
                                                    {flight.actualDelay} min
                                                </div>
                                            </div>
                                            <div style={{
                                                flex: 1, padding: '0.75rem 1rem',
                                                background: D.inner, borderRadius: '8px',
                                                borderLeft: `3px solid ${isAccurate ? D.blue : D.orange}`,
                                                border: `1px solid ${D.border}`,
                                            }}>
                                                <div style={{ fontSize: '0.85rem', color: D.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Predicted</div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isAccurate ? D.blue : D.orange }}>
                                                    {flight.predictedDelay} min
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: isAccurate ? D.blue : D.orange, marginTop: '0.2rem' }}>
                                                    {isAccurate ? '✓ Model Accurate' : '⚠ Model Diverged'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gate info */}
                                        <div style={{ flex: '0 0 90px', minWidth: '80px' }}>
                                            <div style={{ fontSize: '0.85rem', color: D.textMut, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Gate</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: D.textPri }}>{flight.origin.gate || 'TBD'}</div>
                                            <div style={{ fontSize: '0.92rem', color: D.textSec }}>Term {flight.origin.terminal || '–'}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column - Live News Sidebar */}
                <div style={{ flex: '0 0 320px', position: 'sticky', top: '2rem' }}>
                    <div style={{
                        background: D.card,
                        borderRadius: '10px',
                        padding: '1.25rem',
                        border: `1px solid ${D.border}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: D.textPri, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: D.accent }}>
                                    <path d="M19 5V7H15V5H19M9 5V11H5V5H9M19 13V19H15V13H19M9 17V19H5V17H9M21 3H13V9H21V3ZM11 3H3V13H11V3ZM21 11H13V21H21V11ZM11 15H3V21H11V15Z" fill="currentColor" />
                                </svg>
                                Flight News
                            </h3>
                            {news.length > 0 && news[0].source && (
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: 700, color: D.green,
                                    background: 'rgba(34,197,94,0.1)', padding: '3px 8px',
                                    borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '4px' }}>
                            {news.length === 0 ? (
                                <div style={{ color: D.textSec, fontSize: '1.07rem' }}>Fetching news...</div>
                            ) : (
                                news.map((item, i) => {
                                    const sentimentClass = item.sentiment === 'positive' ? 'positive' : item.sentiment === 'negative' ? 'negative' : 'neutral';
                                    const sentimentIcon = item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊';

                                    return (
                                        <div key={i} className="news-item"
                                            style={{ cursor: item.url ? 'pointer' : 'default' }}
                                            onClick={() => item.url && window.open(item.url, '_blank')}
                                        >
                                            <div className="news-header">
                                                <span className="news-category" style={{ color: D.accent }}>{item.category}</span>
                                                <span className={`news-sentiment ${sentimentClass}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {sentimentIcon} {item.sentiment.toUpperCase()}
                                                </span>
                                            </div>
                                            <h4 className="news-title" style={{ color: D.textPri }}>{item.title}</h4>
                                            <div className="news-meta">
                                                <span className="news-airline">{item.source || item.airline}</span>
                                                <span className="news-time">{item.time}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveTracker;
