import { predictFlight } from './predictionEngine.js';
import { generateWeatherData } from './flightUtils.js';

// Add your second API key to this array when you have it!
const API_KEYS = [
    '7e4869ad-e851-4527-9c1e-1e6932745dda', // Key 1
    // 'YOUR_SECOND_KEY_HERE',               // Key 2
];

let currentKeyIndex = 0;

const getActiveApiKey = () => {
    if (API_KEYS.length === 0) return '';
    return API_KEYS[currentKeyIndex];
};

const rotateToNextKey = () => {
    if (API_KEYS.length <= 1) return false; // Nothing to rotate to
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`Rotated to API Key #${currentKeyIndex + 1}`);
    return true;
};
const BASE_URL = 'https://airlabs.co/api/v9';

/**
 * Normalizes raw AirLabs schedule data into our app's LiveFlight format
 */
function normalizeFlight(apiFlight) {
    if (!apiFlight) return null;

    const now = new Date();

    // Parse times (AirLabs provides YYYY-MM-DD HH:MM format)
    const scheduledDep = apiFlight.dep_time ? new Date(apiFlight.dep_time) : now;
    const actualDep = apiFlight.dep_actual ? new Date(apiFlight.dep_actual) : null;
    const estimatedDep = apiFlight.dep_estimated ? new Date(apiFlight.dep_estimated) : null;

    // Use estimated or actual if available
    const activeTime = actualDep || estimatedDep || scheduledDep;

    // Calculate actual delay in minutes (AirLabs sometimes provides this as dep_delayed)
    let actualDelay = apiFlight.dep_delayed || 0;

    if (actualDelay === 0 && activeTime && scheduledDep) {
        // Fallback manual calculation
        const diff = Math.floor((activeTime - scheduledDep) / (1000 * 60));
        actualDelay = Math.max(0, diff);
    }

    // Determine status
    let status = apiFlight.status || 'scheduled';
    if (status === 'active' || (status === 'scheduled' && actualDep)) {
        status = 'active';
    }

    const mockWeather = generateWeatherData();
    const flightForPrediction = {
        airline: apiFlight.airline_iata || 'UNK',
        scheduledDepartureTime: scheduledDep.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        origin: apiFlight.dep_iata || 'UNK',
        destination: apiFlight.arr_iata || 'UNK'
    };

    const scheduledFormat = scheduledDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const scheduledDate = scheduledDep.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    const actualFormat = actualDep ? actualDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (estimatedDep ? estimatedDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
    const actualDate = actualDep ? actualDep.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : (estimatedDep ? estimatedDep.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : null);

    const prediction = predictFlight({
        flight: flightForPrediction,
        weatherData: mockWeather,
        month: now.toLocaleString('default', { month: 'short' }),
        dayName: now.toLocaleDateString('en-US', { weekday: 'long' })
    });

    return {
        id: `${apiFlight.flight_iata || apiFlight.flight_number}-${scheduledDep.getTime()}`,
        flightNumber: apiFlight.flight_iata || apiFlight.flight_number || 'Unknown',
        airline: apiFlight.airline_iata || 'Unknown',
        status: status,

        origin: {
            code: apiFlight.dep_iata || 'UNK',
            name: `${apiFlight.dep_iata} Airport`, // AirLabs schedules API only gives IATA
            terminal: apiFlight.dep_terminal || '-',
            gate: apiFlight.dep_gate || 'TBD'
        },
        destination: {
            code: apiFlight.arr_iata || 'UNK',
            name: `${apiFlight.arr_iata} Airport`
        },

        scheduledTimeDisplay: scheduledFormat,
        scheduledDateDisplay: scheduledDate,
        actualTimeDisplay: actualFormat,
        actualDateDisplay: actualDate,
        actualDelay: actualDelay || 0,

        // Include our internal prediction for comparison
        predictedDelay: prediction.estimatedDelay,
        riskLevel: prediction.riskLevel,
        riskScore: prediction.riskScore,

        live: null // AirLabs requires a separate hit to /flights for telemetry, we skip to save quota
    };
}

/**
 * Fetch live departure schedules from AirLabs
 * Supports automatic key rotation on rate limits
 */
export async function fetchLiveFlights(params = {}, retryCount = 0) {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
        console.warn("No AirLabs API key found. Using mock data.");
        return { data: getMockFlights(params.dep_iata), usingMock: true, error: "No API Key" };
    }

    try {
        const queryParams = new URLSearchParams({
            api_key: apiKey
        });

        // Map unified params to AirLabs specific fields
        if (params.dep_iata) queryParams.append('dep_iata', params.dep_iata);
        if (params.arr_iata) queryParams.append('arr_iata', params.arr_iata);
        if (params.airline_name) queryParams.append('airline_iata', params.airline_name); // AirLabs prefers IATA
        if (params.flight_iata) queryParams.append('flight_iata', params.flight_iata);

        const response = await fetch(`${BASE_URL}/schedules?${queryParams}`);

        // Handle Rate Limits (429 Too Many Requests or specific AirLabs error codes)
        if (response.status === 429) {
            throw new Error("RATE_LIMIT");
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // AirLabs sometimes returns 200 OK but embeds the error
        if (data.error) {
            if (data.error.message && data.error.message.includes("quota")) {
                throw new Error("RATE_LIMIT");
            }
            console.error("AirLabs API Error:", data.error);
            return { data: getMockFlights(params.dep_iata), usingMock: true, error: data.error.message || "API Error" };
        }

        if (!data.response || data.response.length === 0) {
            return { data: [], usingMock: false };
        }

        // Limit to reasonable number to prevent massive renders if they just search "DEL"
        const topResults = data.response.slice(0, Math.min(params.limit || 30, data.response.length));
        const normalized = topResults.map(normalizeFlight).filter(Boolean);

        return { data: normalized, usingMock: false };

    } catch (error) {
        if (error.message === "RATE_LIMIT" && retryCount < API_KEYS.length - 1) {
            console.warn("API Key quota reached. Rotating to next key...");
            if (rotateToNextKey()) {
                // Retry the same request with the new active key
                return fetchLiveFlights(params, retryCount + 1);
            }
        }

        console.error("Failed to fetch live flights:", error);
        return {
            data: getMockFlights(params.dep_iata),
            usingMock: true,
            error: error.message === "RATE_LIMIT" ? "All API quotas reached" : error.message
        };
    }
}

/**
 * Generates realistic mock data for India flights when API is unavailable
 */
function getMockFlights(depIata = 'DEL') {
    const airlines = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air'];
    const codes = { 'IndiGo': '6E', 'Air India': 'AI', 'Vistara': 'UK', 'SpiceJet': 'SG', 'Akasa Air': 'QP' };
    const hubs = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'GOI', 'PNQ', 'AMD'];

    return Array.from({ length: 15 }).map((_, i) => {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const code = codes[airline];
        const num = Math.floor(Math.random() * 900) + 100;

        let arrIata = hubs[Math.floor(Math.random() * hubs.length)];
        while (arrIata === depIata) arrIata = hubs[Math.floor(Math.random() * hubs.length)];

        const now = new Date();
        const schedMin = Math.floor(Math.random() * 180) - 90; // -90 to +90 mins from now
        const scheduledTime = new Date(now.getTime() + schedMin * 60000);

        // Determine status and delays
        const rand = Math.random();
        let status = 'active';
        let actualDelay = 0;
        let actualTime = new Date(scheduledTime);
        let predictedDelay = 0;

        if (rand > 0.90) {
            status = 'cancelled';
            predictedDelay = Math.floor(Math.random() * 40) + 60;
        } else if (rand > 0.65) {
            status = 'active'; // Delayed
            actualDelay = Math.floor(Math.random() * 50) + 20; // 20-70 min delay
            actualTime = new Date(scheduledTime.getTime() + actualDelay * 60000);
            predictedDelay = actualDelay + (Math.floor(Math.random() * 20) - 10);
        } else if (rand > 0.4 && schedMin > 15) {
            status = 'scheduled';
            actualTime = null;
        } else {
            // on time
            actualDelay = Math.floor(Math.random() * 5);
            actualTime = new Date(scheduledTime.getTime() + actualDelay * 60000);
            predictedDelay = Math.floor(Math.random() * 10);
        }

        // Live stats for active flights
        const live = status === 'active' ? {
            altitude: Math.floor(Math.random() * 30000) + 5000,
            speed: Math.floor(Math.random() * 400) + 300,
            isGround: false
        } : null;

        return {
            id: `MOCK-${i}`,
            flightNumber: `${code}${num}`,
            airline,
            status,
            origin: { code: depIata, name: `${depIata} Airport`, terminal: Math.floor(Math.random() * 3) + 1, gate: `A${Math.floor(Math.random() * 20) + 1}` },
            destination: { code: arrIata, name: `${arrIata} Airport` },
            scheduledDateDisplay: scheduledTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            scheduledTimeDisplay: scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actualDateDisplay: actualTime ? actualTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : null,
            actualTimeDisplay: actualTime ? actualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            actualDelay: actualDelay,
            predictedDelay: Math.max(0, predictedDelay),
            riskLevel: predictedDelay > 45 ? 'high' : predictedDelay > 15 ? 'medium' : 'low',
            riskScore: predictedDelay > 45 ? 80 : predictedDelay > 15 ? 40 : 10,
            live
        };
    }).sort((a, b) => a.departureTime - b.departureTime);
}
