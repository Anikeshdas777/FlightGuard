// ==================== Data Configuration ====================
const AIRLINES = [
    'IndiGo', 'SpiceJet', 'Air India', 'Vistara', 'Go First',
    'AirAsia India', 'Air India Express', 'Alliance Air'
];

const AIRPORTS = [
    { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai' },
    { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore' },
    { code: 'MAA', name: 'Chennai International', city: 'Chennai' },
    { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata' },
    { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad' },
    { code: 'COK', name: 'Cochin International', city: 'Kochi' },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad' },
    { code: 'PNQ', name: 'Pune Airport', city: 'Pune' },
    { code: 'GOI', name: 'Goa International', city: 'Goa' },
    { code: 'JAI', name: 'Jaipur International', city: 'Jaipur' },
    { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International', city: 'Guwahati' },
    { code: 'IXC', name: 'Chandigarh International', city: 'Chandigarh' },
    { code: 'TRV', name: 'Trivandrum International', city: 'Trivandrum' },
    { code: 'VNS', name: 'Lal Bahadur Shastri International', city: 'Varanasi' }
];

const WEATHER_CONDITIONS = [
    'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain',
    'Thunderstorms', 'Fog', 'Haze', 'Monsoon', 'Dust Storm'
];

const DELAY_FACTORS = [
    'Weather Conditions', 'Air Traffic Congestion', 'Aircraft Maintenance',
    'Crew Delays', 'Airport Delays', 'Technical Issues', 'Security Delays',
    'Passenger Boarding', 'Fuel Issues', 'Previous Flight Delay', 'VIP Movement', 'Runway Congestion'
];

const NEWS_TOPICS = [
    { title: 'IndiGo announces new routes connecting tier-2 cities', airline: 'IndiGo', sentiment: 'positive', category: 'Route Expansion' },
    { title: 'SpiceJet faces delays due to technical issues at Mumbai airport', airline: 'SpiceJet', sentiment: 'negative', category: 'Operations' },
    { title: 'Air India receives new aircraft, improving fleet reliability', airline: 'Air India', sentiment: 'positive', category: 'Fleet Update' },
    { title: 'Vistara reports on-time performance improvement by 12%', airline: 'Vistara', sentiment: 'positive', category: 'Performance' },
    { title: 'Heavy monsoon rains cause widespread flight disruptions in Kerala', airline: 'All Airlines', sentiment: 'negative', category: 'Weather' },
    { title: 'Delhi Airport implements AI-based traffic management system', airline: 'All Airlines', sentiment: 'positive', category: 'Technology' },
    { title: 'Go First expands operations with increased frequency on popular routes', airline: 'Go First', sentiment: 'positive', category: 'Operations' },
    { title: 'Fog conditions at Delhi airport lead to morning flight delays', airline: 'All Airlines', sentiment: 'negative', category: 'Weather' },
    { title: 'AirAsia India launches special fares for festive season', airline: 'AirAsia India', sentiment: 'positive', category: 'Pricing' },
    { title: 'Air India Express announces direct flight to Middle East destinations', airline: 'Air India Express', sentiment: 'positive', category: 'Route Expansion' },
    { title: 'Chennai Airport undergoes runway maintenance, minimal impact expected', airline: 'All Airlines', sentiment: 'neutral', category: 'Infrastructure' },
    { title: 'IndiGo pilots report improved working conditions', airline: 'IndiGo', sentiment: 'positive', category: 'Labor' },
    { title: 'Bangalore Airport sets new record for daily passenger traffic', airline: 'All Airlines', sentiment: 'positive', category: 'Traffic' },
    { title: 'Cyclone warning issued for coastal regions, flights may be affected', airline: 'All Airlines', sentiment: 'negative', category: 'Weather' },
    { title: 'Vistara introduces premium economy class on domestic routes', airline: 'Vistara', sentiment: 'positive', category: 'Service' }
];

// ==================== State Management ====================
let allFlights = [];
let filteredFlights = [];
let updateInterval = null;
let lastUpdateTime = new Date();

// ==================== Utility Functions ====================
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

function randomChoices(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function generateFlightNumber(airline) {
    const airlineCode = airline.substring(0, 2).toUpperCase();
    const number = randomInt(100, 9999);
    return `${airlineCode}${number}`;
}

// ==================== Data Generation ====================
function generateWeatherData() {
    return {
        condition: randomChoice(WEATHER_CONDITIONS),
        temperature: randomInt(15, 40), // Celsius for Indian context
        visibility: randomInt(2, 10),
        windSpeed: randomInt(5, 45),
        precipitation: randomInt(0, 100)
    };
}

function calculateDelayRisk(weather, departureTime, factors) {
    let riskScore = randomInt(0, 30); // Base risk

    // Weather impact
    if (weather.condition === 'Heavy Rain' || weather.condition === 'Thunderstorms') {
        riskScore += randomInt(20, 35);
    } else if (weather.condition === 'Light Rain' || weather.condition === 'Fog') {
        riskScore += randomInt(10, 20);
    } else if (weather.condition === 'Snow') {
        riskScore += randomInt(25, 40);
    }

    // Wind impact
    if (weather.windSpeed > 25) {
        riskScore += randomInt(10, 20);
    }

    // Time of day impact (peak hours in India)
    const hour = departureTime.getHours();
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
        riskScore += randomInt(5, 15);
    }

    // Factor impact
    riskScore += factors.length * randomInt(3, 8);

    return Math.min(riskScore, 100);
}

function getRiskLevel(score) {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
}

function generateFlight() {
    const airline = randomChoice(AIRLINES);
    const origin = randomChoice(AIRPORTS);
    let destination = randomChoice(AIRPORTS);

    // Ensure origin and destination are different
    while (destination.code === origin.code) {
        destination = randomChoice(AIRPORTS);
    }

    const now = new Date();
    const departureTime = new Date(now.getTime() + randomInt(0, 720) * 60000); // 0-12 hours from now
    const weather = generateWeatherData();
    const factors = randomChoices(DELAY_FACTORS, randomInt(1, 4));
    const riskScore = calculateDelayRisk(weather, departureTime, factors);
    const riskLevel = getRiskLevel(riskScore);

    // Calculate predicted delay
    let predictedDelay = 0;
    if (riskLevel === 'low') {
        predictedDelay = randomInt(0, 15);
    } else if (riskLevel === 'medium') {
        predictedDelay = randomInt(15, 45);
    } else if (riskLevel === 'high') {
        predictedDelay = randomInt(45, 90);
    } else {
        predictedDelay = randomInt(90, 180);
    }

    return {
        id: Math.random().toString(36).substring(7),
        flightNumber: generateFlightNumber(airline),
        airline: airline,
        origin: origin,
        destination: destination,
        departureTime: departureTime,
        status: riskLevel === 'critical' ? 'Delayed' : (riskLevel === 'high' ? 'Warning' : 'On Time'),
        riskScore: riskScore,
        riskLevel: riskLevel,
        predictedDelay: predictedDelay,
        weather: weather,
        factors: factors,
        gate: `${randomChoice(['A', 'B', 'C', 'D'])}${randomInt(1, 50)}`,
        terminal: randomInt(1, 5)
    };
}

function generateInitialFlights(count = 12) {
    const flights = [];
    for (let i = 0; i < count; i++) {
        flights.push(generateFlight());
    }
    return flights.sort((a, b) => b.riskScore - a.riskScore);
}

// ==================== UI Rendering ====================
function renderFlightCard(flight) {
    return `
        <div class="flight-card" data-id="${flight.id}" onclick="showFlightDetails('${flight.id}')">
            <div class="flight-header">
                <div>
                    <div class="flight-number">${flight.flightNumber}</div>
                    <div class="airline">${flight.airline}</div>
                </div>
                <span class="risk-badge ${flight.riskLevel}">${flight.riskLevel} Risk</span>
            </div>
            
            <div class="flight-route">
                <div class="airport-code">${flight.origin.code}</div>
                <div class="route-arrow"></div>
                <div class="airport-code">${flight.destination.code}</div>
            </div>
            
            <div class="flight-details">
                <div class="detail-item">
                    <span class="detail-label">Departure</span>
                    <span class="detail-value">${formatTime(flight.departureTime)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gate</span>
                    <span class="detail-value">${flight.gate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Terminal</span>
                    <span class="detail-value">T${flight.terminal}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${flight.status}</span>
                </div>
            </div>
            
            ${flight.predictedDelay > 0 ? `
                <div class="delay-prediction">
                    <div class="prediction-text">Predicted Delay</div>
                    <div class="prediction-time">${flight.predictedDelay} minutes</div>
                </div>
            ` : ''}
            
            <div class="contributing-factors">
                <div class="factors-title">Contributing Factors:</div>
                <div class="factors-list">
                    ${flight.factors.map(factor => `<span class="factor-tag">${factor}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderFlights() {
    const grid = document.getElementById('flightsGrid');
    if (filteredFlights.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No flights match your criteria</p>';
    } else {
        grid.innerHTML = filteredFlights.map(renderFlightCard).join('');
    }
}

function updateStats() {
    const totalFlights = allFlights.length;
    const highRiskFlights = allFlights.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').length;

    animateCounter('totalFlights', totalFlights);
    animateCounter('highRiskFlights', highRiskFlights);

    document.getElementById('lastUpdate').textContent = formatTimeSince(lastUpdateTime);
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    const steps = Math.abs(target - current);

    if (steps === 0) return;

    let count = current;
    const interval = setInterval(() => {
        count += increment;
        element.textContent = count;

        if (count === target) {
            clearInterval(interval);
        }
    }, 50);
}

function formatTimeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

// ==================== Weather & Airport Info ====================
function renderWeatherInfo() {
    const weather = generateWeatherData();
    const html = `
        <div class="weather-item">
            <span class="weather-label">Condition</span>
            <span class="weather-value">${weather.condition}</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">Temperature</span>
            <span class="weather-value">${weather.temperature}°C</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">Visibility</span>
            <span class="weather-value">${weather.visibility} mi</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">Wind Speed</span>
            <span class="weather-value">${weather.windSpeed} mph</span>
        </div>
    `;
    document.getElementById('weatherInfo').innerHTML = html;
}

function renderAirportInfo() {
    const airports = randomChoices(AIRPORTS, 3);
    const html = airports.map(airport => {
        const isDelayed = Math.random() > 0.6;
        return `
            <div class="airport-item">
                <div class="airport-name">${airport.code} - ${airport.name}</div>
                <div class="airport-status">
                    <span class="status-indicator ${isDelayed ? 'delayed' : 'normal'}">
                        ${isDelayed ? 'Delays Expected' : 'Normal Operations'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('airportInfo').innerHTML = html;
}

// ==================== News Feed ====================
function generateNewsTimestamp() {
    const hoursAgo = randomInt(1, 24);
    const now = new Date();
    const newsTime = new Date(now.getTime() - hoursAgo * 3600000);
    return `${hoursAgo}h ago`;
}

function renderNewsItem(newsItem) {
    const sentimentClass = newsItem.sentiment === 'positive' ? 'positive' : newsItem.sentiment === 'negative' ? 'negative' : 'neutral';
    const sentimentIcon = newsItem.sentiment === 'positive' ? '📈' : newsItem.sentiment === 'negative' ? '📉' : '📊';

    return `
        <div class="news-item">
            <div class="news-header">
                <span class="news-category">${newsItem.category}</span>
                <span class="news-sentiment ${sentimentClass}">${sentimentIcon} ${newsItem.sentiment}</span>
            </div>
            <h4 class="news-title">${newsItem.title}</h4>
            <div class="news-meta">
                <span class="news-airline">${newsItem.airline}</span>
                <span class="news-time">${generateNewsTimestamp()}</span>
            </div>
        </div>
    `;
}

function renderNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;

    const selectedNews = randomChoices(NEWS_TOPICS, 5);
    newsContainer.innerHTML = selectedNews.map(renderNewsItem).join('');
}

// ==================== Modal ====================
function showFlightDetails(flightId) {
    const flight = allFlights.find(f => f.id === flightId);
    if (!flight) return;

    const modalHtml = `
        <h2 style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <span>${flight.flightNumber}</span>
            <span class="risk-badge ${flight.riskLevel}">${flight.riskLevel} Risk</span>
        </h2>
        
        <div style="background: rgba(102, 126, 234, 0.1); padding: 1.5rem; border-radius: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-around; align-items: center; font-size: 2rem; font-weight: 700;">
                <div style="text-align: center;">
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">From</div>
                    <div>${flight.origin.code}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${flight.origin.city}</div>
                </div>
                <div style="font-size: 1.5rem; color: var(--accent-purple);">→</div>
                <div style="text-align: center;">
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">To</div>
                    <div>${flight.destination.code}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${flight.destination.city}</div>
                </div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Flight Information</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Airline</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.airline}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Departure Time</div>
                <div style="color: var(--text-primary); font-weight: 600;">${formatTime(flight.departureTime)}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Gate</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.gate}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Terminal</div>
                <div style="color: var(--text-primary); font-weight: 600;">T${flight.terminal}</div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Delay Prediction Analysis</h3>
        <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid var(--risk-critical); margin-bottom: 1.5rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Risk Score</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--risk-critical); margin-bottom: 1rem;">${flight.riskScore}/100</div>
            <div style="background: rgba(255, 255, 255, 0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="width: ${flight.riskScore}%; height: 100%; background: ${flight.riskLevel === 'low' ? 'var(--risk-low)' :
            flight.riskLevel === 'medium' ? 'var(--risk-medium)' :
                flight.riskLevel === 'high' ? 'var(--risk-high)' :
                    'var(--risk-critical)'
        }; transition: width 0.5s ease;"></div>
            </div>
        </div>
        
        ${flight.predictedDelay > 0 ? `
            <div style="background: rgba(251, 146, 60, 0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.25rem;">Predicted Delay</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--risk-high);">${flight.predictedDelay} minutes</div>
            </div>
        ` : ''}
        
        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Contributing Factors</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
            ${flight.factors.map(factor => `
                <span style="padding: 0.5rem 1rem; background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 1rem; font-size: 0.875rem;">
                    ${factor}
                </span>
            `).join('')}
        </div>
        
        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Weather Conditions</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Condition</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.weather.condition}</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Temperature</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.weather.temperature}°F</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Visibility</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.weather.visibility} mi</div>
            </div>
            <div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">Wind Speed</div>
                <div style="color: var(--text-primary); font-weight: 600;">${flight.weather.windSpeed} mph</div>
            </div>
        </div>
    `;

    document.getElementById('modalBody').innerHTML = modalHtml;
    document.getElementById('flightModal').classList.add('active');
}

function closeModal() {
    document.getElementById('flightModal').classList.remove('active');
}

// ==================== Search & Filter ====================
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const riskFilter = document.getElementById('riskFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter
    filteredFlights = allFlights.filter(flight => {
        const matchesSearch =
            flight.flightNumber.toLowerCase().includes(searchTerm) ||
            flight.airline.toLowerCase().includes(searchTerm) ||
            flight.origin.code.toLowerCase().includes(searchTerm) ||
            flight.destination.code.toLowerCase().includes(searchTerm) ||
            flight.origin.city.toLowerCase().includes(searchTerm) ||
            flight.destination.city.toLowerCase().includes(searchTerm);

        const matchesRisk = riskFilter === 'all' || flight.riskLevel === riskFilter;

        return matchesSearch && matchesRisk;
    });

    // Sort
    if (sortBy === 'risk') {
        filteredFlights.sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortBy === 'time') {
        filteredFlights.sort((a, b) => a.departureTime - b.departureTime);
    } else if (sortBy === 'airline') {
        filteredFlights.sort((a, b) => a.airline.localeCompare(b.airline));
    }

    renderFlights();
}

// ==================== Real-time Updates ====================
function updateFlightData() {
    // Randomly update some flights
    allFlights.forEach(flight => {
        if (Math.random() > 0.7) {
            // Small chance to update risk score
            flight.riskScore = Math.max(0, Math.min(100, flight.riskScore + randomInt(-5, 5)));
            flight.riskLevel = getRiskLevel(flight.riskScore);

            // Update predicted delay based on new risk
            if (flight.riskLevel === 'low') {
                flight.predictedDelay = randomInt(0, 15);
            } else if (flight.riskLevel === 'medium') {
                flight.predictedDelay = randomInt(15, 45);
            } else if (flight.riskLevel === 'high') {
                flight.predictedDelay = randomInt(45, 90);
            } else {
                flight.predictedDelay = randomInt(90, 180);
            }

            // Update status
            flight.status = flight.riskLevel === 'critical' ? 'Delayed' : (flight.riskLevel === 'high' ? 'Warning' : 'On Time');
        }
    });

    lastUpdateTime = new Date();
    applyFilters();
    updateStats();
}

function startLiveUpdates() {
    // Update every 5 seconds
    updateInterval = setInterval(() => {
        updateFlightData();
        renderWeatherInfo();
    }, 5000);

    // Update "last update" timer every second
    setInterval(() => {
        document.getElementById('lastUpdate').textContent = formatTimeSince(lastUpdateTime);
    }, 1000);
}

// ==================== Event Listeners ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    allFlights = generateInitialFlights(12);
    filteredFlights = [...allFlights];

    // Render initial state
    renderFlights();
    updateStats();
    renderWeatherInfo();
    renderAirportInfo();
    renderNews();

    // Start live updates
    startLiveUpdates();

    // Search and filter events
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('riskFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);

    // Modal events
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
});
