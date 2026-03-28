/**
 * aviationstackApi.js – Fetches real-time flight data from AviationStack.
 * Used for airport delay status in Sidebar and live alerts in Alerts page.
 *
 * Free tier: HTTP only, 100 requests/month.
 */

const API_KEY = '54c6ce4f905b4850a6db213b3c128b52';
const BASE_URL = 'http://api.aviationstack.com/v1';

/**
 * Fetch flights departing from a given airport IATA code.
 * Returns raw flight records with delay/status info.
 */
export async function fetchFlightsFromAirport(airportCode, limit = 30) {
    try {
        const url = `${BASE_URL}/flights?access_key=${API_KEY}&dep_iata=${airportCode}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.error) {
            console.warn('AviationStack API error:', data.error);
            return null;
        }

        return data.data || [];
    } catch (err) {
        console.warn(`AviationStack fetch failed for ${airportCode}:`, err.message);
        return null;
    }
}

/**
 * Determine airport operational status by checking its departing flights
 * for delays and cancellations.
 */
export async function fetchAirportStatus(airportCode, airportName) {
    const flights = await fetchFlightsFromAirport(airportCode, 50);
    if (!flights) {
        // API failed — return unknown status
        return { code: airportCode, name: airportName, isDelayed: false, live: false };
    }

    let delayedCount = 0;
    let cancelledCount = 0;

    flights.forEach(f => {
        const status = (f.flight_status || '').toLowerCase();
        if (status === 'cancelled') {
            cancelledCount++;
        } else if (f.departure?.delay && f.departure.delay > 15) {
            delayedCount++;
        }
    });

    const totalChecked = flights.length;
    // If >25% of flights are delayed/cancelled, mark airport as having delays
    const isDelayed = totalChecked > 0 && ((delayedCount + cancelledCount) / totalChecked) > 0.25;

    return {
        code: airportCode,
        name: airportName,
        isDelayed,
        delayedCount,
        cancelledCount,
        totalChecked,
        live: true,
    };
}

/**
 * Fetch status for multiple Indian airports.
 * Returns array compatible with Sidebar's airportStatuses prop.
 */
export async function fetchMultiAirportStatus(airports) {
    try {
        const results = await Promise.all(
            airports.map(ap => fetchAirportStatus(ap.code, ap.name))
        );
        return results.map(r => ({
            airport: { code: r.code, name: r.name },
            isDelayed: r.isDelayed,
            delayedCount: r.delayedCount || 0,
            cancelledCount: r.cancelledCount || 0,
            totalChecked: r.totalChecked || 0,
            live: r.live || false,
        }));
    } catch (err) {
        console.warn('Multi-airport status fetch failed:', err.message);
        return null;
    }
}

/**
 * Fetch flight delays/disruptions from a set of major airports
 * and convert them into alert objects for the Alerts page.
 *
 * Returns an array of alert-shaped objects sorted by severity.
 */
export async function fetchLiveFlightAlerts(airportCodes = ['DEL', 'BOM', 'BLR', 'CCU']) {
    try {
        const allAlerts = [];
        let idCounter = 10000;

        for (const code of airportCodes) {
            const flights = await fetchFlightsFromAirport(code, 25);
            if (!flights) continue;

            flights.forEach(f => {
                const status = (f.flight_status || '').toLowerCase();
                const delay = f.departure?.delay || 0;
                const flightIata = f.flight?.iata || f.flight?.number || 'Unknown';
                const airline = f.airline?.name || 'Unknown Airline';
                const depIata = f.departure?.iata || code;
                const arrIata = f.arrival?.iata || '???';
                const depTime = f.departure?.scheduled || '';

                let severity = null;
                let title = '';
                let message = '';
                let icon = '';
                let category = 'Operational';

                if (status === 'cancelled') {
                    severity = 'critical';
                    icon = '🚫';
                    title = `Flight Cancelled — ${airline} ${flightIata}`;
                    message = `${depIata} → ${arrIata} has been cancelled. Passengers should contact the airline for rebooking.`;
                    category = 'Operational';
                } else if (delay >= 60) {
                    severity = 'high';
                    icon = '⏱️';
                    title = `Major Delay — ${airline} ${flightIata} (${delay} min)`;
                    message = `Departing ${depIata} → ${arrIata}, delayed by ${delay} minutes. Scheduled: ${depTime ? new Date(depTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}.`;
                    category = 'Operational';
                } else if (delay >= 15) {
                    severity = 'medium';
                    icon = '⚠️';
                    title = `Delayed — ${airline} ${flightIata} (${delay} min)`;
                    message = `${depIata} → ${arrIata} delayed by ${delay} minutes at departure.`;
                    category = 'Operational';
                }

                if (severity) {
                    allAlerts.push({
                        id: `live-${idCounter++}`,
                        severity,
                        category,
                        title,
                        message,
                        time: 'Live',
                        flights: [flightIata],
                        icon,
                        isLive: true,
                    });
                }
            });
        }

        // Sort: critical first, then high, medium, low
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        allAlerts.sort((a, b) => (order[a.severity] || 9) - (order[b.severity] || 9));

        return allAlerts;
    } catch (err) {
        console.warn('Live flight alerts fetch failed:', err.message);
        return [];
    }
}

/**
 * Convert alarming/negative news items into alert objects
 * so they can be displayed in the Alerts page.
 */
export function newsToAlerts(newsItems) {
    if (!newsItems || !Array.isArray(newsItems)) return [];

    let idCounter = 20000;
    return newsItems
        .filter(n => n.sentiment === 'negative')
        .map(n => ({
            id: `news-${idCounter++}`,
            severity: 'medium',
            category: 'News',
            title: n.title,
            message: `Source: ${n.source || 'News'}. Category: ${n.category || 'Aviation'}.`,
            time: n.time || 'Recently',
            flights: [],
            icon: '📰',
            isLive: true,
            url: n.url || null,
        }));
}
