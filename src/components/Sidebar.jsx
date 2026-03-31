// This file shows the weather, airport, and news sidebar widgets.
import React from 'react';
import { randomChoices } from '../utils/flightUtils.js';
import { AIRPORTS, NEWS_TOPICS } from '../data/constants.js';
import { useLanguage } from '../context/LanguageContext.jsx';

// This function creates a simple timestamp label for news.
function generateNewsTimestamp() {
    const hoursAgo = Math.floor(Math.random() * 24) + 1;
    return `${hoursAgo}h ago`;
}

// This component renders the sidebar view.
function Sidebar({ weather, airportStatuses, news }) {
    const { t } = useLanguage();
    return (
        <aside className="sidebar" id="sidebar">
            <div className="sidebar-content">
                {/* Weather */}
                <h3 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M6.76 4.84L4.96 3.05L3.55 4.46L5.34 6.25C4.52 7.39 4 8.79 4 10.3C4 13.03 5.78 15.34 8.23 16.16C8.09 16.43 8 16.74 8 17.08V21H16V17.08C16 16.74 15.91 16.43 15.77 16.16C18.22 15.34 20 13.03 20 10.3C20 6.46 16.84 3.3 13 3.3C11.49 3.3 10.09 3.82 8.95 4.64L6.76 4.84Z"
                                fill="currentColor"
                            />
                        </svg>
                        {t('weather')} ({weather.city || 'Delhi'})
                    </div>
                    {weather.isLive && (
                        <span style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#22c55e',
                            background: 'rgba(34,197,94,0.1)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            border: '1px solid rgba(34,197,94,0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            {t('live')}
                        </span>
                    )}
                </h3>
                <div className="weather-grid" id="weatherInfo">
                    <div className="weather-item">
                        <span className="weather-label">{t('condition')}</span>
                        <span className="weather-value">{weather.condition}</span>
                    </div>
                    <div className="weather-item">
                        <span className="weather-label">{t('temperature')}</span>
                        <span className="weather-value">{weather.temperature}°C</span>
                    </div>
                    <div className="weather-item">
                        <span className="weather-label">{t('visibility')}</span>
                        <span className="weather-value">{weather.visibility} mi</span>
                    </div>
                    <div className="weather-item">
                        <span className="weather-label">{t('windSpeed')}</span>
                        <span className="weather-value">{weather.windSpeed} mph</span>
                    </div>
                </div>

                {/* Airport Status */}
                <h3 className="sidebar-title">
                    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                            fill="currentColor"
                        />
                    </svg>
                    {t('airportStatus')}
                </h3>
                <div className="airport-info" id="airportInfo">
                    {airportStatuses.map((item) => (
                        <div key={item.airport.code} className="airport-item">
                            <div className="airport-name">{item.airport.code} - {item.airport.name}</div>
                            <div className="airport-status">
                                <span className={`status-indicator ${item.isDelayed ? 'delayed' : 'normal'}`}>
                                    {item.isDelayed ? t('delaysExpected') : t('normalOperations')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live News */}
                <h3 className="sidebar-title" style={{ marginTop: '1.5rem' }}>
                    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19 5V7H15V5H19M9 5V11H5V5H9M19 13V19H15V13H19M9 17V19H5V17H9M21 3H13V9H21V3ZM11 3H3V13H11V3ZM21 11H13V21H21V11ZM11 15H3V21H11V15Z"
                            fill="currentColor"
                        />
                    </svg>
                    {t('flightNews')}
                    {news.length > 0 && news[0].source && (
                        <span style={{
                            marginLeft: 'auto',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#22c55e',
                            background: 'rgba(34,197,94,0.1)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            border: '1px solid rgba(34,197,94,0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            {t('live')}
                        </span>
                    )}
                </h3>
                <div className="news-container" id="newsContainer">
                    {news.map((item, i) => {
                        const sentimentClass = item.sentiment === 'positive' ? 'positive' : item.sentiment === 'negative' ? 'negative' : 'neutral';
                        const sentimentIcon = item.sentiment === 'positive' ? '📈' : item.sentiment === 'negative' ? '📉' : '📊';
                        const isLive = !!item.source; // Real news has a source field

                        return (
                            <div
                                key={i}
                                className="news-item"
                                style={{ cursor: item.url ? 'pointer' : 'default' }}
                                onClick={() => item.url && window.open(item.url, '_blank')}
                            >
                                <div className="news-header">
                                    <span className="news-category">{item.category}</span>
                                    <span className={`news-sentiment ${sentimentClass}`}>{sentimentIcon} {item.sentiment}</span>
                                </div>
                                <h4 className="news-title">{item.title}</h4>
                                <div className="news-meta">
                                    <span className="news-airline">
                                        {isLive ? item.source : item.airline}
                                    </span>
                                    <span className="news-time">
                                        {isLive ? item.time : generateNewsTimestamp()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
