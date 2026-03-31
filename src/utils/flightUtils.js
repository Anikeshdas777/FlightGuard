// This file contains helper functions for mock flight and risk data.
import { AIRLINES, AIRPORTS, WEATHER_CONDITIONS, DELAY_FACTORS } from '../data/constants.js';

// This function returns a random whole number in a range.
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This function picks one random item from a list.
export function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

// This function picks multiple random items from a list.
export function randomChoices(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// This function formats a date into a simple time string.
export function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

// This function shows how much time has passed since a date.
export function formatTimeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

// This function creates sample weather data for the app.
export function generateWeatherData() {
    return {
        condition: randomChoice(WEATHER_CONDITIONS),
        temperature: randomInt(15, 40),
        visibility: randomInt(2, 10),
        windSpeed: randomInt(5, 45),
        precipitation: randomInt(0, 100),
    };
}

// This function calculates a delay risk score for a flight.
export function calculateDelayRisk(weather, departureTime, factors) {
    let riskScore = randomInt(0, 30);

    if (weather.condition === 'Heavy Rain' || weather.condition === 'Thunderstorms') {
        riskScore += randomInt(20, 35);
    } else if (weather.condition === 'Light Rain' || weather.condition === 'Fog') {
        riskScore += randomInt(10, 20);
    } else if (weather.condition === 'Snow') {
        riskScore += randomInt(25, 40);
    }

    if (weather.windSpeed > 25) {
        riskScore += randomInt(10, 20);
    }

    const hour = departureTime.getHours();
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
        riskScore += randomInt(5, 15);
    }

    riskScore += factors.length * randomInt(3, 8);
    return Math.min(riskScore, 100);
}

// This function converts a risk score into a risk label.
export function getRiskLevel(score) {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
}

// This function builds a flight number from an airline name.
function generateFlightNumber(airline) {
    const airlineCode = airline.substring(0, 2).toUpperCase();
    const number = randomInt(100, 9999);
    return `${airlineCode}${number}`;
}

// This function creates one sample flight record.
export function generateFlight() {
    const airline = randomChoice(AIRLINES);
    const origin = randomChoice(AIRPORTS);
    let destination = randomChoice(AIRPORTS);
    while (destination.code === origin.code) {
        destination = randomChoice(AIRPORTS);
    }

    const now = new Date();
    const departureTime = new Date(now.getTime() + randomInt(0, 720) * 60000);
    const weather = generateWeatherData();
    const factors = randomChoices(DELAY_FACTORS, randomInt(1, 4));
    const riskScore = calculateDelayRisk(weather, departureTime, factors);
    const riskLevel = getRiskLevel(riskScore);

    let predictedDelay = 0;
    if (riskLevel === 'low') predictedDelay = randomInt(0, 15);
    else if (riskLevel === 'medium') predictedDelay = randomInt(15, 45);
    else if (riskLevel === 'high') predictedDelay = randomInt(45, 90);
    else predictedDelay = randomInt(90, 180);

    return {
        id: Math.random().toString(36).substring(7),
        flightNumber: generateFlightNumber(airline),
        airline,
        origin,
        destination,
        departureTime,
        status: riskLevel === 'critical' ? 'Delayed' : riskLevel === 'high' ? 'Warning' : 'On Time',
        riskScore,
        riskLevel,
        predictedDelay,
        weather,
        factors,
        gate: `${randomChoice(['A', 'B', 'C', 'D'])}${randomInt(1, 50)}`,
        terminal: randomInt(1, 5),
    };
}

// This function creates the starting list of sample flights.
export function generateInitialFlights(count = 12) {
    const flights = [];
    for (let i = 0; i < count; i++) flights.push(generateFlight());
    return flights.sort((a, b) => b.riskScore - a.riskScore);
}

// This function creates a simple timestamp label for news.
export function generateNewsTimestamp() {
    const hoursAgo = randomInt(1, 24);
    return `${hoursAgo}h ago`;
}
