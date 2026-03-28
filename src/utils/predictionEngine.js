import { AIRLINE_RELIABILITY, MONTH_RISK } from './csvParser.js';
import { getWeatherRisk } from './weatherApi.js';

// ─── Holiday & Peak Traffic Definitions ─────────────────────────────────────
// Distances are in days. "radius" is how many days before/after are affected.
export const INDIAN_HOLIDAYS = [
    { name: 'Republic Day', month: 1, date: 26, radius: 2, severity: 12 },
    { name: 'Holi', month: 3, date: 25, radius: 3, severity: 15 }, // Varies, assuming March 25 for 2024
    { name: 'Summer Vacations Start', month: 5, date: 15, radius: 10, severity: 10 },
    { name: 'Independence Day', month: 8, date: 15, radius: 2, severity: 12 },
    { name: 'Raksha Bandhan', month: 8, date: 19, radius: 2, severity: 8 },
    { name: 'Gandhi Jayanti', month: 10, date: 2, radius: 1, severity: 5 },
    { name: 'Dussehra', month: 10, date: 12, radius: 3, severity: 18 }, // Varies
    { name: 'Diwali Rush', month: 10, date: 31, radius: 5, severity: 25 }, // Varies
    { name: 'Chhath Puja', month: 11, date: 7, radius: 3, severity: 15 }, // Varies
    { name: 'Christmas', month: 12, date: 25, radius: 4, severity: 18 },
    { name: 'New Year Eve', month: 12, date: 31, radius: 3, severity: 20 },
];

/**
 * Check if a given date falls within a holiday rush window.
 * Returns { risk: number, name: string } or { risk: 0 }
 */
export function getHolidayAtDate(dateObj) {
    const month = dateObj.getMonth() + 1; // 1-12
    const day = dateObj.getDate();

    let maxRisk = 0;
    let activeHoliday = null;

    for (const hol of INDIAN_HOLIDAYS) {
        // Simple approximation for radius across same month (cross-month is complex but this works for demo)
        if (hol.month === month) {
            const diff = Math.abs(day - hol.date);
            if (diff <= hol.radius) {
                // Closer to the actual date = higher severity
                const urgencyMultiplier = 1 - (diff / (hol.radius + 1));
                const currentRisk = Math.round(hol.severity * urgencyMultiplier);
                if (currentRisk > maxRisk) {
                    maxRisk = currentRisk;
                    activeHoliday = hol;
                }
            }
        }
    }

    return activeHoliday ? { risk: maxRisk, name: activeHoliday.name } : { risk: 0, name: null };
}

/**
 * Parse a departure time string "HH:MM" and return hour (0-23).
 */
function parseHour(timeStr) {
    if (!timeStr) return 12;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) || 12;
}

/**
 * Get a time-of-day risk score (0-15).
 * Peak hours (6-9am, 5-8pm) have higher congestion risk.
 */
function getTimeRisk(hour) {
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) return 15;
    if ((hour >= 10 && hour <= 12) || (hour >= 21 && hour <= 23)) return 8;
    if (hour >= 0 && hour <= 4) return 5; // late night – less congestion
    return 5;
}

/**
 * Get a day-of-week risk score (0-10).
 * Weekends and Fridays are busier.
 */
function getDayRisk(dayName) {
    const busy = ['friday', 'saturday', 'sunday'];
    const moderate = ['monday', 'thursday'];
    const d = dayName.toLowerCase();
    if (busy.includes(d)) return 10;
    if (moderate.includes(d)) return 6;
    return 3;
}

/**
 * Get airline-based risk score (0-20).
 * Based on DGCA historical on-time performance.
 */
function getAirlineRisk(airlineName) {
    const key = airlineName.toLowerCase();
    const found = Object.keys(AIRLINE_RELIABILITY).find(k => key.includes(k));
    if (found) {
        const stats = AIRLINE_RELIABILITY[found];
        // cancelRate is %, e.g. 3.5% → risk points
        return Math.min(20, stats.cancelRate * 3.5);
    }
    return 10; // unknown airline – moderate risk
}

/**
 * Get route-based risk (0-10).
 * Some routes are historically more prone to delays (e.g., fog-prone northern airports).
 */
function getRouteRisk(origin, destination) {
    const fogProne = ['Delhi', 'Lucknow', 'Patna', 'Varanasi', 'Ranchi', 'Chandigarh', 'Amritsar'];
    const islandRemote = ['Port Blair', 'Leh', 'Srinagar', 'Imphal', 'Dimapur'];
    const monsoon = ['Goa', 'Mumbai', 'Kochi', 'Guwahati', 'Bagdogra'];

    let risk = 0;
    if (fogProne.includes(origin) || fogProne.includes(destination)) risk += 5;
    if (islandRemote.includes(origin) || islandRemote.includes(destination)) risk += 7;
    if (monsoon.includes(origin) || monsoon.includes(destination)) risk += 4;
    return Math.min(10, risk);
}

/**
 * Master prediction function.
 * Returns a detailed prediction object.
 */
export function predictFlight({ flight, weatherData, month, dayName }) {
    const hour = parseHour(flight.scheduledDepartureTime);

    const weatherRisk = getWeatherRisk(weatherData);              // 0-40
    const airlineRisk = getAirlineRisk(flight.airline);           // 0-20
    const timeRisk = getTimeRisk(hour);                           // 0-15
    const dayRisk = getDayRisk(dayName);                          // 0-10
    const monthRisk = MONTH_RISK[month] || 8;                    // 0-22
    const routeRisk = getRouteRisk(flight.origin, flight.destination); // 0-10

    // Evaluate if this specific date is a holiday rush
    const holidayInfo = getHolidayAtDate(new Date(flight.dateString || Date.now()));
    const holidayRisk = holidayInfo.risk;                         // 0-25

    const totalScore = weatherRisk + airlineRisk + timeRisk + dayRisk + monthRisk + routeRisk + holidayRisk;
    const cappedScore = Math.min(100, totalScore);

    // Cancellation probability (non-linear, higher for extreme scores)
    let cancelProb;
    if (cappedScore < 25) cancelProb = cappedScore * 0.3;
    else if (cappedScore < 50) cancelProb = 7 + (cappedScore - 25) * 0.7;
    else if (cappedScore < 75) cancelProb = 24 + (cappedScore - 50) * 1.2;
    else cancelProb = 54 + (cappedScore - 75) * 1.8;
    cancelProb = Math.min(99, Math.round(cancelProb));

    // Delay probability (higher threshold)
    const delayProb = Math.min(99, Math.round(cappedScore * 0.85));

    // Risk level classification
    let riskLevel, riskLabel, riskColor;
    if (cappedScore < 25) {
        riskLevel = 'low'; riskLabel = 'Low Risk'; riskColor = '#10b981';
    } else if (cappedScore < 50) {
        riskLevel = 'medium'; riskLabel = 'Medium Risk'; riskColor = '#f59e0b';
    } else if (cappedScore < 75) {
        riskLevel = 'high'; riskLabel = 'High Risk'; riskColor = '#f97316';
    } else {
        riskLevel = 'critical'; riskLabel = 'Critical Risk'; riskColor = '#ef4444';
    }

    // Estimated delay if flight operates
    let estimatedDelay = 0;
    if (riskLevel === 'medium') estimatedDelay = timeRisk * 2 + weatherRisk;
    else if (riskLevel === 'high') estimatedDelay = timeRisk * 4 + weatherRisk * 2;
    else if (riskLevel === 'critical') estimatedDelay = timeRisk * 6 + weatherRisk * 3;

    const airlineKey = Object.keys(AIRLINE_RELIABILITY).find(k =>
        flight.airline.toLowerCase().includes(k)
    );
    const airlineStats = airlineKey ? AIRLINE_RELIABILITY[airlineKey] : null;

    return {
        riskScore: cappedScore,
        riskLevel,
        riskLabel,
        riskColor,
        cancelProb,
        delayProb,
        estimatedDelay: Math.round(estimatedDelay),
        breakdown: {
            weather: weatherRisk,
            airline: Math.round(airlineRisk),
            timeOfDay: timeRisk,
            dayOfWeek: dayRisk,
            season: monthRisk,
            route: routeRisk,
            holiday: holidayRisk,
        },
        holidayName: holidayInfo.name,
        historicalStats: airlineStats
            ? {
                cancelRate: airlineStats.cancelRate,
                delayRate: airlineStats.delayRate,
                name: airlineStats.name,
            }
            : null,
    };
}

/**
 * Generate a 7-day time series forecast relative to the base date.
 */
export function generateTimeSeriesForecast(flight, baseDateObj) {
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast = [];

    // We don't have future 7-day weather, so we use a moving average weather risk or standard baseline
    const baseHour = parseHour(flight.scheduledDepartureTime);
    const airlineRisk = getAirlineRisk(flight.airline);
    const routeRisk = getRouteRisk(flight.origin, flight.destination);

    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(baseDateObj);
        targetDate.setDate(targetDate.getDate() + i);

        const targetMonth = targetDate.getMonth() + 1;
        const targetDayName = DAYS[targetDate.getDay()];

        const dayRisk = getDayRisk(targetDayName);
        const monthRisk = MONTH_RISK[targetMonth] || 8;
        const timeRisk = getTimeRisk(baseHour);

        // Mock a generic acceptable weather risk for future days (0-15) depending on month
        const futureWeatherRisk = (monthRisk > 15) ? 20 : 5;

        const holInfo = getHolidayAtDate(targetDate);

        const total = futureWeatherRisk + airlineRisk + timeRisk + dayRisk + monthRisk + routeRisk + holInfo.risk;
        const capped = Math.min(100, total);

        let level, color;
        if (capped < 25) { level = 'low'; color = '#10b981'; }
        else if (capped < 50) { level = 'medium'; color = '#f59e0b'; }
        else if (capped < 75) { level = 'high'; color = '#f97316'; }
        else { level = 'critical'; color = '#ef4444'; }

        forecast.push({
            dateObj: targetDate,
            dateLabel: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayName: targetDayName.substring(0, 3), // Mon, Tue
            score: capped,
            level,
            color,
            isHoliday: holInfo.risk > 0,
            holidayName: holInfo.name
        });
    }

    return forecast;
}
