import React, { useState, useEffect, useRef } from 'react';
import { formatTimeSince } from '../utils/flightUtils.js';
import { useLanguage } from '../context/LanguageContext.jsx';

function StatsPanel({ flights, lastUpdate }) {
    const { t } = useLanguage();
    const totalFlights = flights.length;
    const highRiskFlights = flights.filter(
        (f) => f.riskLevel === 'high' || f.riskLevel === 'critical'
    ).length;

    const [timeSince, setTimeSince] = useState('Just now');

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeSince(formatTimeSince(lastUpdate));
        }, 1000);
        setTimeSince(formatTimeSince(lastUpdate));
        return () => clearInterval(interval);
    }, [lastUpdate]);

    return (
        <div className="stats-grid">
            {/* Flights Monitored */}
            <div className="stat-card">
                <div className="stat-icon flights-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="stat-content">
                    <p className="stat-label">{t('flightsMonitored')}</p>
                    <p className="stat-value">{totalFlights}</p>
                </div>
            </div>

            {/* High Risk Flights */}
            <div className="stat-card">
                <div className="stat-icon risk-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2L2 7V12C2 16.55 4.84 20.74 9 22C13.16 20.74 16 16.55 16 12V7L12 2ZM12 11H16C16 14.53 14.13 17.68 11 18.86V11H8V5.45L12 3.6V11Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="stat-content">
                    <p className="stat-label">{t('highRiskFlights')}</p>
                    <p className="stat-value high-risk">{highRiskFlights}</p>
                </div>
            </div>

            {/* Prediction Accuracy */}
            <div className="stat-card">
                <div className="stat-icon accuracy-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="stat-content">
                    <p className="stat-label">{t('predictionAccuracy')}</p>
                    <p className="stat-value">94.7%</p>
                </div>
            </div>

            {/* Last Update */}
            <div className="stat-card">
                <div className="stat-icon update-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.74 10.04 18 11 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="stat-content">
                    <p className="stat-label">{t('lastUpdate')}</p>
                    <p className="stat-value small">{timeSince}</p>
                </div>
            </div>
        </div>
    );
}

export default StatsPanel;
