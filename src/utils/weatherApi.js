// This file fetches weather data and converts it into risk values.
const API_KEY = '5835428bae1c076a5c463bd8db2fc976';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Map Indian city names from CSV to OpenWeatherMap query strings
const CITY_WEATHER_MAP = {
    'Delhi': 'Delhi,IN',
    'Mumbai': 'Mumbai,IN',
    'Bengaluru': 'Bangalore,IN',
    'Hyderabad': 'Hyderabad,IN',
    'Chennai': 'Chennai,IN',
    'Kolkata': 'Kolkata,IN',
    'Goa': 'Panaji,IN',
    'Ahmedabad': 'Ahmedabad,IN',
    'Pune': 'Pune,IN',
    'Jaipur': 'Jaipur,IN',
    'Lucknow': 'Lucknow,IN',
    'Kochi': 'Kochi,IN',
    'Patna': 'Patna,IN',
    'Bhubaneswar': 'Bhubaneswar,IN',
    'Ranchi': 'Ranchi,IN',
    'Chandigarh': 'Chandigarh,IN',
    'Guwahati': 'Guwahati,IN',
    'Srinagar': 'Srinagar,IN',
    'Jammu': 'Jammu,IN',
    'Leh': 'Leh,IN',
    'Bagdogra': 'Siliguri,IN',
    'Nagpur': 'Nagpur,IN',
    'Port Blair': 'Port Blair,IN',
    'Amritsar': 'Amritsar,IN',
    'Varanasi': 'Varanasi,IN',
    'Visakhapatnam': 'Visakhapatnam,IN',
    'Imphal': 'Imphal,IN',
    'Dimapur': 'Dimapur,IN',
    'Jodhpur': 'Jodhpur,IN',
    'Udaipur': 'Udaipur,IN',
    'Indore': 'Indore,IN',
    'Bhopal': 'Bhopal,IN',
    'Raipur': 'Raipur,IN',
    'Aurangabad': 'Aurangabad,IN',
    'Tirupati': 'Tirupati,IN',
    'Vijayawada': 'Vijayawada,IN',
    'Calicut': 'Kozhikode,IN',
    'Mangalore': 'Mangalore,IN',
    'Coimbatore': 'Coimbatore,IN',
    'Madurai': 'Madurai,IN',
    'Hubli': 'Hubli,IN',
    'Agra': 'Agra,IN',
    'Khajuraho': 'Khajuraho,IN',
    'Gaya': 'Gaya,IN',
    'Rajkot': 'Rajkot,IN',
    'Vadodara': 'Vadodara,IN',
    'Surat': 'Surat,IN',
};

/**
 * Compute a risk contribution (0–40) from weather data
 */
export function getWeatherRisk(weatherData) {
    if (!weatherData) return 10; // default moderate risk if API failed

    let risk = 0;
    const condition = weatherData.condition.toLowerCase();
    const windSpeed = weatherData.windSpeed;   // km/h
    const visibility = weatherData.visibility; // meters

    if (condition.includes('thunderstorm')) risk += 35;
    else if (condition.includes('snow')) risk += 30;
    else if (condition.includes('heavy rain') || condition.includes('extreme')) risk += 25;
    else if (condition.includes('rain') || condition.includes('drizzle')) risk += 15;
    else if (condition.includes('fog') || condition.includes('haze') || condition.includes('mist')) risk += 20;
    else if (condition.includes('dust') || condition.includes('sand')) risk += 18;
    else if (condition.includes('cloud')) risk += 5;
    else risk += 0; // clear

    // Wind speed penalty (km/h)
    if (windSpeed > 60) risk += 20;
    else if (windSpeed > 40) risk += 12;
    else if (windSpeed > 25) risk += 6;

    // Low visibility penalty
    if (visibility < 500) risk += 20;
    else if (visibility < 1000) risk += 12;
    else if (visibility < 3000) risk += 5;

    return Math.min(40, risk);
}

/**
 * Fetch current weather for a city. Returns structured object or null on failure.
 */
export async function fetchWeather(cityName) {
    const query = CITY_WEATHER_MAP[cityName] || `${cityName},IN`;
    try {
        const res = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();

        return {
            city: cityName,
            condition: data.weather[0].description,
            conditionMain: data.weather[0].main,
            icon: data.weather[0].icon,
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // m/s → km/h
            visibility: data.visibility || 10000, // meters
            feelsLike: Math.round(data.main.feels_like),
        };
    } catch (e) {
        console.warn(`Weather fetch failed for ${cityName}:`, e.message);
        return null;
    }
}
