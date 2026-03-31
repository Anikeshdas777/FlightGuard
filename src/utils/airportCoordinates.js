// This file stores airport coordinate lookup helpers.
export const airportCoordinates = {
    'Delhi': [28.5562, 77.1000],
    'Mumbai': [19.0896, 72.8656],
    'Bengaluru': [13.1989, 77.7068],
    'Hyderabad': [17.2403, 78.4294],
    'Chennai': [12.9941, 80.1709],
    'Kolkata': [22.6520, 88.4467],
    'Ahmedabad': [23.0734, 72.6266],
    'Kochi': [10.1518, 76.3930],
    'Pune': [18.5793, 73.9089],
    'Goa': [15.3801, 73.8313],
    'Lucknow': [26.7606, 80.8893],
    'Jaipur': [26.8242, 75.8122],
    'Amritsar': [31.7096, 74.7973],
    'Guwahati': [26.1061, 91.5859],
    'Visakhapatnam': [17.7211, 83.2778]
};

// Fallback to center of India if airport not found
const FALLBACK_COORD = [20.5937, 78.9629];

// This function returns map coordinates for a city name.
export function getCoordinates(cityName) {
    if (!cityName) return FALLBACK_COORD;
    // Handle potential casing or slight variations
    const key = Object.keys(airportCoordinates).find(k => k.toLowerCase() === cityName.toLowerCase());
    return key ? airportCoordinates[key] : FALLBACK_COORD;
}
