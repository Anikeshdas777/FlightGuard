// This file stores shared static data used across the app.
export const AIRLINES = [
    'IndiGo', 'SpiceJet', 'Air India', 'Vistara', 'Go First',
    'AirAsia India', 'Air India Express', 'Alliance Air'
];

export const AIRPORTS = [
    { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
    { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', lat: 13.1986, lng: 77.7066 },
    { code: 'MAA', name: 'Chennai International', city: 'Chennai', lat: 12.9941, lng: 80.1709 },
    { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', lat: 22.6520, lng: 88.4463 },
    { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', lat: 17.2403, lng: 78.4294 },
    { code: 'COK', name: 'Cochin International', city: 'Kochi', lat: 10.1520, lng: 76.4019 },
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { code: 'PNQ', name: 'Pune Airport', city: 'Pune', lat: 18.5822, lng: 73.9197 },
    { code: 'GOI', name: 'Goa International', city: 'Goa', lat: 15.3808, lng: 73.8314 },
    { code: 'JAI', name: 'Jaipur International', city: 'Jaipur', lat: 26.8242, lng: 75.8122 },
    { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi International', city: 'Guwahati', lat: 26.1061, lng: 91.5859 },
    { code: 'IXC', name: 'Chandigarh International', city: 'Chandigarh', lat: 30.6735, lng: 76.7885 },
    { code: 'TRV', name: 'Trivandrum International', city: 'Trivandrum', lat: 8.4821, lng: 76.9199 },
    { code: 'VNS', name: 'Lal Bahadur Shastri International', city: 'Varanasi', lat: 25.4524, lng: 82.8593 }
];

export const WEATHER_CONDITIONS = [
    'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain',
    'Thunderstorms', 'Fog', 'Haze', 'Monsoon', 'Dust Storm'
];

export const DELAY_FACTORS = [
    'Weather Conditions', 'Air Traffic Congestion', 'Aircraft Maintenance',
    'Crew Delays', 'Airport Delays', 'Technical Issues', 'Security Delays',
    'Passenger Boarding', 'Fuel Issues', 'Previous Flight Delay', 'VIP Movement', 'Runway Congestion'
];

export const NEWS_TOPICS = [
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
