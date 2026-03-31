// This file renders a single flight summary card.
import React from 'react';
import { formatTime } from '../utils/flightUtils.js';

// This component renders the flight card view.
function FlightCard({ flight, onSelect }) {
    return (
        <div className="flight-card" onClick={() => onSelect(flight)}>
            <div className="flight-header">
                <div>
                    <div className="flight-number">{flight.flightNumber}</div>
                    <div className="airline">{flight.airline}</div>
                </div>
                <span className={`risk-badge ${flight.riskLevel}`}>
                    {flight.riskLevel} Risk
                </span>
            </div>

            <div className="flight-route">
                <div className="airport-code">{flight.origin.code}</div>
                <div className="route-arrow"></div>
                <div className="airport-code">{flight.destination.code}</div>
            </div>

            <div className="flight-details">
                <div className="detail-item">
                    <span className="detail-label">Departure</span>
                    <span className="detail-value">{formatTime(flight.departureTime)}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Gate</span>
                    <span className="detail-value">{flight.gate}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Terminal</span>
                    <span className="detail-value">T{flight.terminal}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">{flight.status}</span>
                </div>
            </div>

            {flight.predictedDelay > 0 && (
                <div className="delay-prediction">
                    <div className="prediction-text">Predicted Delay</div>
                    <div className="prediction-time">{flight.predictedDelay} minutes</div>
                </div>
            )}

            <div className="contributing-factors">
                <div className="factors-title">Contributing Factors:</div>
                <div className="factors-list">
                    {flight.factors.map((factor, i) => (
                        <span key={i} className="factor-tag">{factor}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FlightCard;
