// This file renders the grid of flight cards.
import React from 'react';
import FlightCard from './FlightCard.jsx';

// This component renders the flight grid view.
function FlightGrid({ flights, onSelect }) {
    if (flights.length === 0) {
        return (
            <div className="flights-grid">
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                    No flights match your criteria
                </p>
            </div>
        );
    }

    return (
        <div className="flights-grid">
            {flights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} onSelect={onSelect} />
            ))}
        </div>
    );
}

export default FlightGrid;
