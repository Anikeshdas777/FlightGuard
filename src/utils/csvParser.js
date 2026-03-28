/**
 * Parse the Indian flight schedule CSV.
 * Returns an array of flight objects.
 */
export async function loadFlightSchedule() {
    try {
        const res = await fetch('/data/flights.csv');
        const text = await res.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        return lines.slice(1).map(line => {
            // Handle quoted fields (e.g., "Monday, Wednesday, Friday")
            const cols = [];
            let inQuote = false;
            let cur = '';
            for (const ch of line) {
                if (ch === '"') { inQuote = !inQuote; }
                else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; }
                else { cur += ch; }
            }
            cols.push(cur.trim());

            const obj = {};
            headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
            return obj;
        }).filter(r => r.flightNumber && r.airline);
    } catch (e) {
        console.error('Failed to load flight schedule CSV:', e);
        return [];
    }
}

/**
 * Search for flights matching airline + flightNumber.
 * Returns all matching schedule rows.
 */
export function findFlight(schedule, airline, flightNumber) {
    const num = String(flightNumber).trim();
    const air = airline.trim().toLowerCase();
    return schedule.filter(row =>
        String(row.flightNumber).trim() === num &&
        row.airline.toLowerCase() === air
    );
}

/**
 * Check if a flight row operates on a given day of week.
 */
export function operatesOnDay(row, dayName) {
    const days = row.dayOfWeek || '';
    return days.toLowerCase().includes(dayName.toLowerCase());
}

// Hardcoded historical cancellation & delay rates for Indian airlines
// Sourced from DGCA On-Time Performance reports (public data)
export const AIRLINE_RELIABILITY = {
    'indigo': { cancelRate: 1.2, delayRate: 18, name: 'IndiGo' },
    'air india': { cancelRate: 3.5, delayRate: 28, name: 'Air India' },
    'spicejet': { cancelRate: 4.2, delayRate: 32, name: 'SpiceJet' },
    'goair': { cancelRate: 2.8, delayRate: 24, name: 'GoAir' },
    'go first': { cancelRate: 2.8, delayRate: 24, name: 'Go First' },
    'vistara': { cancelRate: 1.8, delayRate: 20, name: 'Vistara' },
    'akasa': { cancelRate: 2.0, delayRate: 19, name: 'Akasa Air' },
    'alliance air': { cancelRate: 3.0, delayRate: 26, name: 'Alliance Air' },
    'star air': { cancelRate: 2.5, delayRate: 22, name: 'Star Air' },
};

/**
 * Month-based risk factor (1-12).
 * Higher values = months with more disruptions (monsoon season June-Sept in India).
 */
export const MONTH_RISK = {
    1: 8,   // Jan - mild winter fog in north India
    2: 5,   // Feb - good weather
    3: 4,   // Mar - good weather
    4: 5,   // Apr - pre-monsoon heat
    5: 8,   // May - severe heat, dust storms
    6: 18,  // Jun - monsoon begins
    7: 22,  // Jul - peak monsoon
    8: 20,  // Aug - peak monsoon
    9: 15,  // Sep - monsoon retreating
    10: 6,  // Oct - post-monsoon, good
    11: 7,  // Nov - winter fog starting
    12: 10, // Dec - dense fog in north India
};
