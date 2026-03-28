import React, { useState, useEffect, useRef } from 'react';
import { loadFlightSchedule, findFlight, operatesOnDay } from '../utils/csvParser.js';
import { fetchWeather } from '../utils/weatherApi.js';
import { predictFlight, generateTimeSeriesForecast } from '../utils/predictionEngine.js';
import HolidayCalendar from './HolidayCalendar.jsx';
import FlightMap from './FlightMap.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { AIRPORTS } from '../data/constants.js';

// Build a fast code → city lookup from the shared constants
const CITY_NAMES = Object.fromEntries(AIRPORTS.map(a => [a.code, a.city]));

const AIRLINES = [
    'GoAir', 'Air India', 'IndiGo', 'SpiceJet', 'Vistara',
    'Alliance Air', 'Star Air', 'Akasa',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function RiskGauge({ score, color, t }) {
    // Clamp score and prevent it from being exactly 0 so the SVG path renders properly
    const clampedScore = Math.max(0.01, Math.min(100, score || 0));
    // Calculate radians mapping [0, 100] to Pi -> 0 radians (180 to 0 degrees)
    const rad = Math.PI * (1 - (clampedScore / 100));
    const x = 60 + 50 * Math.cos(rad);
    const y = 60 - 50 * Math.sin(rad);

    return (
        <svg viewBox="0 0 120 70" width="200" height="120">
            {/* Background arc */}
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
            {/* Colored progress arc */}
            <path
                d={`M 10 60 A 50 50 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
            />
            {/* Score text */}
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{Math.round(score)}</text>
            <text x="60" y="68" textAnchor="middle" fill="#94a3b8" fontSize="8">{t('riskScore')}</text>
        </svg>
    );
}

function BreakdownBar({ label, value, max, color }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8', fontSize: '16px' }}>{label}</span>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>{value}/{max}</span>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '4px', height: '6px' }}>
                <div style={{
                    width: `${pct}%`, height: '6px', borderRadius: '4px',
                    background: color, transition: 'width 0.6s ease'
                }} />
            </div>
        </div>
    );
}

export default function FlightPredictor({ onPrediction }) {
    const { t } = useLanguage();
    const [schedule, setSchedule] = useState([]);
    const [scheduleLoaded, setScheduleLoaded] = useState(false);

    const [airline, setAirline] = useState('GoAir');
    const [customAirline, setCustomAirline] = useState('');
    const [flightNumber, setFlightNumber] = useState('');
    const [date, setDate] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    // Load CSV on mount
    useEffect(() => {
        loadFlightSchedule().then(data => {
            setSchedule(data);
            setScheduleLoaded(true);
        });
    }, []);

    async function handlePredict(e) {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const selectedAirline = airline === '__custom__' ? customAirline : airline;
            if (!flightNumber.trim()) throw new Error('Please enter a flight number.');
            if (!selectedAirline.trim()) throw new Error('Please enter an airline name.');

            // 1. Find flight in schedule
            const matches = findFlight(schedule, selectedAirline, flightNumber.trim());
            if (matches.length === 0) {
                throw new Error(`Flight ${selectedAirline} ${flightNumber} not found in schedule. Try a different airline or number.`);
            }

            // 2. Check if it operates on the selected day
            const dateObj = new Date(date);
            const dayName = DAYS[dateObj.getDay()];
            const operatingMatch = matches.find(m => operatesOnDay(m, dayName));

            const flightRow = operatingMatch || matches[0];
            const doesOperate = !!operatingMatch;

            // 3. Fetch real weather for departure city
            const weatherData = await fetchWeather(flightRow.origin);

            // 4. Run prediction
            const month = dateObj.getMonth() + 1;
            const prediction = predictFlight({
                flight: flightRow,
                weatherData,
                month,
                dayName: doesOperate ? dayName : DAYS[dateObj.getDay()],
            });

            const timeSeries = generateTimeSeriesForecast(flightRow, dateObj);

            const predResult = {
                flight: flightRow,
                prediction,
                timeSeries,
                weather: weatherData,
                dayName,
                doesOperate,
                date: dateObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            };
            setResult(predResult);

            // Log to user history if callback provided
            if (onPrediction) {
                onPrediction({
                    airline: selectedAirline,
                    flightNumber: flightNumber.trim(),
                    origin: flightRow.origin,
                    destination: flightRow.destination,
                    riskLevel: prediction.riskLevel,
                    estimatedDelay: prediction.estimatedDelay,
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ padding: '48px 0', fontFamily: "'Inter', sans-serif" }}>
            <div className="container">
                <div className="glass-panel animate-fade-in-up" autoFocus style={{
                    borderRadius: '16px',
                    padding: '36px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative gradient orb */}
                    <div style={{
                        position: 'absolute', top: '-60px', right: '-60px',
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
                        <h2 style={{ color: 'white', fontSize: '29px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>
                            {t('flightRiskAnalysis')}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '17px', fontWeight: 400 }}>
                            {t('flightRiskSubtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handlePredict}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '24px' }}>

                            {/* Airline */}
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {t('airline')}
                                </label>
                                <select
                                    id="tour-step-1"
                                    value={airline}
                                    onChange={e => setAirline(e.target.value)}
                                    style={inputStyle}
                                >
                                    {AIRLINES.map(a => <option key={a} value={a} style={{ background: '#111111', color: 'white' }}>{a}</option>)}
                                    <option value="__custom__" style={{ background: '#111111', color: 'white' }}>{t('otherTypBelow')}</option>
                                </select>
                                {airline === '__custom__' && (
                                    <input
                                        type="text"
                                        placeholder={t('enterAirlineName')}
                                        value={customAirline}
                                        onChange={e => setCustomAirline(e.target.value)}
                                        style={{ ...inputStyle, marginTop: '8px' }}
                                    />
                                )}
                            </div>

                            {/* Flight Number */}
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {t('flightNumber')}
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 572"
                                    value={flightNumber}
                                    onChange={e => setFlightNumber(e.target.value.replace(/\D/g, ''))}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    <span>{t('date')}</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(true)}
                                        style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: 600, textDecoration: 'underline' }}
                                    >
                                        {t('viewCalendar')}
                                    </button>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div style={{ textAlign: 'center' }}>
                            <button
                                id="tour-step-2"
                                type="submit"
                                disabled={loading || !scheduleLoaded}
                                style={{
                                    background: loading ? 'rgba(255,255,255,0.1)' : 'var(--accent-primary)',
                                    color: 'white',
                                    border: loading ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                    borderRadius: '8px',
                                    padding: '14px 36px',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: loading ? 'none' : '0 8px 25px rgba(var(--accent-rgb), 0.4)'
                                }}
                                onMouseOver={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(var(--accent-rgb), 0.6)'; } }}
                                onMouseOut={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(var(--accent-rgb), 0.4)'; } }}
                            >
                                {!scheduleLoaded ? t('loadingSchedule') : loading ? t('analysing') : t('predictFlightRisk')}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: '24px', padding: '16px', borderRadius: '12px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#fca5a5', textAlign: 'center'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <ResultCard result={result} t={t} />
                    )}

                    {/* Calendar Modal */}
                    {showCalendar && (
                        <HolidayCalendar onClose={() => setShowCalendar(false)} />
                    )}
                </div>
            </div>
        </section>
    );
}

function ResultCard({ result, t }) {
    const { lang } = useLanguage();
    const { flight, prediction, timeSeries, weather, dayName, doesOperate, date } = result;
    const { riskScore, riskLevel, riskLabel, riskColor, cancelProb, delayProb, estimatedDelay, breakdown, historicalStats, holidayName } = prediction;

    const weatherIcon = weather
        ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
        : null;

    const handleSpeak = () => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text to speech!");
            return;
        }
        window.speechSynthesis.cancel();
        
        const verdict = cancelProb >= 60
            ? t('highCancellation')
            : cancelProb >= 35
                ? t('significantRisk')
                : cancelProb >= 15
                    ? t('moderateRisk')
                    : t('flightSafe');
                    
        const template = t('spokenStatus') || t('flightSafe');
        const textToSpeak = template
            .replace('{airline}', flight.airline)
            .replace('{flightNumber}', flight.flightNumber)
            .replace('{origin}', flight.origin)
            .replace('{destination}', flight.destination)
            .replace('{verdict}', verdict)
            .replace('{estimatedDelay}', estimatedDelay);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        const langMap = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'sa': 'hi-IN',
            'ur': 'ur-PK'
        };
        utterance.lang = langMap[lang] || 'en-US';
        utterance.rate = 0.9;
        
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div style={{
            marginTop: '36px',
            animation: 'fadeInUp 0.5s ease',
        }}>
            {/* Flight info bar */}
            <div style={{
                background: 'rgba(99,102,241,0.1)',
                border: `1px solid ${riskColor}40`,
                borderRadius: '14px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '4px' }}>{t('flight')}</div>
                    <div style={{ color: 'white', fontSize: '25px', fontWeight: 700 }}>
                        {flight.airline} {flight.flightNumber}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>
                            <span style={{ color: 'white', fontWeight: 700 }}>{flight.origin}</span>
                            {CITY_NAMES[flight.origin] && <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '1px' }}>{CITY_NAMES[flight.origin]}</div>}
                        </span>
                        <span>→</span>
                        <span>
                            <span style={{ color: 'white', fontWeight: 700 }}>{flight.destination}</span>
                            {CITY_NAMES[flight.destination] && <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '1px' }}>{CITY_NAMES[flight.destination]}</div>}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '4px' }}>{t('departure')}</div>
                    <div style={{ color: 'white', fontSize: '25px', fontWeight: 700 }}>
                        {flight.scheduledDepartureTime || 'N/A'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '16px' }}>{date}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '4px' }}>{t('operatesOn')} {dayName.toUpperCase()}?</div>
                    <div style={{
                        fontSize: '23px', fontWeight: 700,
                        color: doesOperate ? '#10b981' : '#ef4444'
                    }}>
                        {doesOperate ? t('yes') : t('notScheduled')}
                    </div>
                </div>
                <div style={{
                    background: riskColor + '22',
                    border: `2px solid ${riskColor}`,
                    borderRadius: '12px',
                    padding: '10px 20px',
                    textAlign: 'center',
                }}>
                    <div style={{ color: riskColor, fontSize: '25px', fontWeight: 800 }}>{riskLabel}</div>
                </div>
            </div>

            {/* Interactive Flight Map */}
            <div style={{ marginBottom: '24px' }}>
                <FlightMap origin={flight.origin} destination={flight.destination} riskColor={riskColor} />
            </div>

            {/* Main prediction grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>

                {/* Risk gauge card */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>{t('overallRiskScore')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <RiskGauge score={riskScore} color={riskColor} t={t} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                            <StatBox label={t('cancellationProb')} value={`${cancelProb}%`} color={riskColor} />
                            <StatBox label={t('delayProb')} value={`${delayProb}%`} color="#f59e0b" />
                            {estimatedDelay > 0 && (
                                <StatBox label={t('estDelay')} value={`${estimatedDelay} min`} color="#8b5cf6" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Risk breakdown card */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>{t('riskBreakdown')}</h3>
                    {breakdown.holiday > 0 && (
                        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '8px' }}>
                            <div style={{ color: '#fdba74', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{t('holidayRushPenalty')}</div>
                            <div style={{ color: '#ffedd5', fontSize: '16px' }}>{holidayName} — High expected traffic and congestion delays. (+{breakdown.holiday} risk pts)</div>
                        </div>
                    )}
                    <BreakdownBar label={`🌤️ ${t('weather')}`} value={breakdown.weather} max={40} color="var(--accent-primary)" />
                    <BreakdownBar label={`✈️ ${t('airlineReliability')}`} value={breakdown.airline} max={20} color="#8b5cf6" />
                    <BreakdownBar label={`🌧️ ${t('seasonMonth')}`} value={breakdown.season} max={22} color="#06b6d4" />
                    <BreakdownBar label={`⏰ ${t('timeOfDay')}`} value={breakdown.timeOfDay} max={15} color="#f59e0b" />
                    <BreakdownBar label={`📅 ${t('dayOfWeek')}`} value={breakdown.dayOfWeek} max={10} color="#10b981" />
                    <BreakdownBar label={`🗺️ ${t('routeRisk')}`} value={breakdown.route} max={10} color="#f97316" />
                </div>

                {/* Weather card */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>{t('liveWeatherAt')} {flight.origin}{CITY_NAMES[flight.origin] ? ` — ${CITY_NAMES[flight.origin]}` : ''}</h3>
                    {weather ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                {weatherIcon && <img src={weatherIcon} alt={weather.condition} width={60} height={60} />}
                                <div>
                                    <div style={{ color: 'white', fontSize: '23px', fontWeight: 700, textTransform: 'capitalize' }}>
                                        {weather.condition}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '17px' }}>{weather.temperature}°C</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <WeatherStat label="💨 Wind" value={`${weather.windSpeed} km/h`} />
                                <WeatherStat label="👁 Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
                                <WeatherStat label="💧 Humidity" value={`${weather.humidity}%`} />
                                <WeatherStat label="🌡 Feels Like" value={`${weather.feelsLike}°C`} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                            {t('weatherUnavailable')}
                        </div>
                    )}

                    {/* Historical stats */}
                    {historicalStats && (
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '8px' }}>
                                {t('historicalDgca')} — {historicalStats.name}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <WeatherStat label={t('avgCancelRate')} value={`${historicalStats.cancelRate}%`} />
                                <WeatherStat label={t('avgDelayRate')} value={`${historicalStats.delayRate}%`} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 7-Day Time Series Chart */}
            {timeSeries && timeSeries.length > 0 && (
                <div style={{ ...cardStyle, marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ ...cardTitle, marginBottom: 0 }}>{t('sevenDayForecast')}</h3>
                        <div style={{ color: '#94a3b8', fontSize: '15px' }}>{t('comparingDates')}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
                        {timeSeries.map((day, idx) => (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 6px', position: 'relative' }}>
                                {/* Tooltip hover effect could go here */}
                                <div style={{ color: day.color, fontSize: '19px', fontWeight: 800, marginBottom: '6px' }}>{day.score}</div>
                                <div style={{
                                    width: '100%', maxWidth: '40px',
                                    height: `${Math.max(10, day.score * 1.3)}px`,
                                    background: `linear-gradient(to top, ${day.color}33, ${day.color})`,
                                    borderRadius: '6px 6px 0 0',
                                    border: `1px solid ${day.color}`,
                                    borderBottom: 'none',
                                    transition: 'height 0.4s ease',
                                    position: 'relative',
                                }}>
                                    {day.isHoliday && (
                                        <div style={{ position: 'absolute', top: '-14px', width: '100%', textAlign: 'center', fontSize: '15px' }}>✨</div>
                                    )}
                                </div>
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <div style={{ color: idx === 0 ? 'white' : '#94a3b8', fontSize: '16px', fontWeight: idx === 0 ? 700 : 500 }}>
                                        {idx === 0 ? t('today') : day.dayName}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '14px' }}>{day.dateLabel}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verdict banner */}
            <div style={{
                marginTop: '24px',
                padding: '20px 28px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${riskColor}22, ${riskColor}11)`,
                border: `1px solid ${riskColor}50`,
                textAlign: 'center',
                position: 'relative',
            }}>
                <button 
                    onClick={handleSpeak}
                    title={t('listenStatus')}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    🔊
                </button>
                <div style={{ fontSize: '31px', marginBottom: '8px' }}>
                    {cancelProb >= 60 ? '🚫' : cancelProb >= 35 ? '⚠️' : cancelProb >= 15 ? '🟡' : '✅'}
                </div>
                <div style={{ color: 'white', fontSize: '21px', fontWeight: 700, marginBottom: '6px' }}>
                    {cancelProb >= 60
                        ? t('highCancellation')
                        : cancelProb >= 35
                            ? t('significantRisk')
                            : cancelProb >= 15
                                ? t('moderateRisk')
                                : t('flightSafe')}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '17px' }}>
                    {t('aiConfidence')}
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px 12px',
            border: `1px solid ${color}30`,
        }}>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>{label}</div>
            <div style={{ color, fontSize: '25px', fontWeight: 800 }}>{value}</div>
        </div>
    );
}

function WeatherStat({ label, value }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 10px' }}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</div>
            <div style={{ color: 'white', fontSize: '17px', fontWeight: 600 }}>{value}</div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '14px 18px',
    color: 'white',
    fontSize: '17px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
};

const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
};

const cardTitle = {
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '18px',
};
