// This file assembles the main FlightGuard application screens and providers.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Header from './components/Header.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import SearchBar from './components/SearchBar.jsx';
import FlightGrid from './components/FlightGrid.jsx';
import Sidebar from './components/Sidebar.jsx';
import FlightModal from './components/FlightModal.jsx';
import FlightPredictor from './components/FlightPredictor.jsx';
import Analytics from './components/Analytics.jsx';
import Alerts from './components/Alerts.jsx';
import LiveTracker from './components/LiveTracker.jsx';
import About from './components/About.jsx';
import AuthPage from './components/AuthPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import AirportHeatmap from './components/AirportHeatmap.jsx';
import OnboardingTour from './components/OnboardingTour.jsx';
import IndiaFlightMap from './components/IndiaFlightMap.jsx';
import { fetchAviationNews } from './utils/newsApi.js';
import { fetchWeather } from './utils/weatherApi.js';
import { addToHistory } from './utils/authService.js';
import { fetchMultiAirportStatus, fetchLiveFlightAlerts, newsToAlerts } from './utils/aviationstackApi.js';
import {
    generateInitialFlights,
    generateWeatherData,
    getRiskLevel,
    randomInt,
    randomChoices,
} from './utils/flightUtils.js';
import { AIRPORTS, NEWS_TOPICS } from './data/constants.js';

// This function creates sample airport delay status data.
function generateAirportStatuses() {
    return randomChoices(AIRPORTS, 3).map((airport) => ({
        airport,
        isDelayed: Math.random() > 0.6,
    }));
}

const WEATHER_CITIES = ['Delhi', 'Goa', 'Kolkata', 'Mumbai', 'Bengaluru', 'Chennai'];

// ─── Inner App (needs auth context) ─────────────────────────────────────────
function AppInner() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [currentPage, setCurrentPage] = useState('dashboard');

    const [flights, setFlights] = useState(() => generateInitialFlights(12));
    const [weather, setWeather] = useState(() => generateWeatherData());
    const [airportStatuses, setAirportStatuses] = useState(() => generateAirportStatuses());
    const [news, setNews] = useState(() => randomChoices(NEWS_TOPICS, 5));
    const [lastUpdate, setLastUpdate] = useState(() => new Date());
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [cityIndex, setCityIndex] = useState(0);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [alarmingNews, setAlarmingNews] = useState([]);

    // Fetch real aviation news on mount
    useEffect(() => {
        fetchAviationNews().then(liveNews => {
            if (liveNews && liveNews.length > 0) {
                setNews(liveNews);
                // Convert alarming (negative) news to alert objects
                setAlarmingNews(newsToAlerts(liveNews));
            }
        });
    }, []);

    // Fetch real airport statuses from AviationStack on mount
    useEffect(() => {
        const topAirports = [
            { code: 'DEL', name: 'Indira Gandhi International' },
            { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International' },
            { code: 'BLR', name: 'Kempegowda International' },
        ];
        fetchMultiAirportStatus(topAirports).then(statuses => {
            if (statuses && statuses.length > 0) {
                setAirportStatuses(statuses);
            }
        });
    }, []);

    // Fetch live flight delay alerts from AviationStack on mount
    useEffect(() => {
        fetchLiveFlightAlerts(['DEL', 'BOM', 'BLR']).then(alerts => {
            if (alerts && alerts.length > 0) {
                setLiveAlerts(alerts);
            }
        });
    }, []);

    // Fetch real weather data when city changes
    useEffect(() => {
        const currentCity = WEATHER_CITIES[cityIndex];
        fetchWeather(currentCity).then(liveWeather => {
            if (liveWeather) {
                setWeather({
                    city: currentCity,
                    condition: liveWeather.conditionMain,
                    temperature: liveWeather.temperature,
                    visibility: Math.round(liveWeather.visibility / 1609),
                    windSpeed: Math.round(liveWeather.windSpeed / 1.609),
                    precipitation: liveWeather.humidity,
                    isLive: true,
                });
            } else {
                // Keep existing weather but update mock city name if failure 
                setWeather(prev => ({
                    ...prev,
                    city: currentCity
                }));
            }
        });
    }, [cityIndex]);

    // Rotate city every 10 seconds for the weather widget
    useEffect(() => {
        // This function handles city interval.
        const cityInterval = setInterval(() => {
            setCityIndex(prev => (prev + 1) % WEATHER_CITIES.length);
        }, 10000);
        return () => clearInterval(cityInterval);
    }, []);

    // Filter / sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [sortBy, setSortBy] = useState('risk');

    // Live updates every 5 seconds
    useEffect(() => {
        // This function handles interval.
        const interval = setInterval(() => {
            setFlights((prev) =>
                prev.map((flight) => {
                    if (Math.random() > 0.7) {
                        const newScore = Math.max(0, Math.min(100, flight.riskScore + randomInt(-5, 5)));
                        const newLevel = getRiskLevel(newScore);
                        let predictedDelay = 0;
                        if (newLevel === 'low') predictedDelay = randomInt(0, 15);
                        else if (newLevel === 'medium') predictedDelay = randomInt(15, 45);
                        else if (newLevel === 'high') predictedDelay = randomInt(45, 90);
                        else predictedDelay = randomInt(90, 180);
                        return { ...flight, riskScore: newScore, riskLevel: newLevel, predictedDelay, status: newLevel === 'critical' ? 'Delayed' : newLevel === 'high' ? 'Warning' : 'On Time' };
                    }
                    return flight;
                })
            );
            setWeather(prev => prev.isLive ? prev : generateWeatherData());
            setLastUpdate(new Date());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Prediction history logger — called by FlightPredictor
    const handlePrediction = useCallback((result) => {
        if (user && result) {
            addToHistory(user.uid, {
                airline: result.airline,
                flightNumber: result.flightNumber || '',
                origin: result.origin || '',
                destination: result.destination || '',
                riskLevel: result.riskLevel,
                predictedDelay: result.estimatedDelay,
            });
        }
    }, [user]);

    // Derived: filtered + sorted flights
    const filteredFlights = useMemo(() => {
        const term = searchTerm.toLowerCase();
        let result = flights.filter((flight) => {
            const matchesSearch =
                flight.flightNumber.toLowerCase().includes(term) ||
                flight.airline.toLowerCase().includes(term) ||
                flight.origin.code.toLowerCase().includes(term) ||
                flight.destination.code.toLowerCase().includes(term) ||
                flight.origin.city.toLowerCase().includes(term) ||
                flight.destination.city.toLowerCase().includes(term);
            const matchesRisk = riskFilter === 'all' || flight.riskLevel === riskFilter;
            return matchesSearch && matchesRisk;
        });
        if (sortBy === 'risk') result = result.sort((a, b) => b.riskScore - a.riskScore);
        else if (sortBy === 'time') result = result.sort((a, b) => a.departureTime - b.departureTime);
        else if (sortBy === 'airline') result = result.sort((a, b) => a.airline.localeCompare(b.airline));
        return result;
    }, [flights, searchTerm, riskFilter, sortBy]);

    const handleCloseModal = useCallback(() => setSelectedFlight(null), []);

    // Show auth page if user requested it or is not logged in
    if (!user && currentPage === 'auth') {
        return <AuthPage />;
    }

    return (
        <>
            <Header currentPage={currentPage} onNavigate={setCurrentPage} />

            {/* ── AUTH PAGE ── */}
            {currentPage === 'auth' && <AuthPage />}

            {/* ── PROFILE PAGE ── */}
            {currentPage === 'profile' && user && <ProfilePage onNavigate={setCurrentPage} />}

            {/* ── HEATMAP PAGE ── */}
            {currentPage === 'heatmap' && <AirportHeatmap />}

            {/* ── ANALYTICS PAGE ── */}
            {currentPage === 'analytics' && <Analytics />}

            {/* ── ALERTS PAGE ── */}
            {currentPage === 'alerts' && <Alerts liveAlerts={liveAlerts} alarmingNews={alarmingNews} />}

            {/* ── ABOUT PAGE ── */}
            {currentPage === 'about' && <About />}

            {/* ── LIVE TRACKER PAGE ── */}
            {currentPage === 'livetracker' && <LiveTracker news={news} />}

            {/* ── DASHBOARD PAGE ── */}
            {currentPage === 'dashboard' && (
                <>
                    <div className="main-content-layout">
                        <section className="hero">
                        <div className="container">
                            <h1 className="hero-title">{t('heroTitle')}</h1>
                            <p className="hero-subtitle">
                                {t('heroSubtitle')}
                            </p>
                            <StatsPanel flights={flights} lastUpdate={lastUpdate} />
                        </div>
                    </section>

                    <FlightPredictor onPrediction={handlePrediction} />

                    <IndiaFlightMap flights={flights} />

                    <main className="dashboard">
                        <div className="container">
                            <SearchBar
                                searchTerm={searchTerm}
                                riskFilter={riskFilter}
                                sortBy={sortBy}
                                onSearchChange={setSearchTerm}
                                onRiskChange={setRiskFilter}
                                onSortChange={setSortBy}
                            />
                            <div className="update-text" style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                                {t('lastUpdatedAt')}: {lastUpdate.toLocaleTimeString()}
                            </div>
                            <FlightGrid flights={filteredFlights} onSelect={setSelectedFlight} />
                        </div>
                    </main>
                    </div>

                    <Sidebar
                        weather={weather}
                        airportStatuses={airportStatuses}
                        news={news}
                    />

                    {selectedFlight && (
                        <FlightModal flight={selectedFlight} onClose={handleCloseModal} />
                    )}
                </>
            )}
            <OnboardingTour />
        </>
    );
}

// ─── Root App with Provider ───────────────────────────────────────────────────
function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <AppInner />
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App;
