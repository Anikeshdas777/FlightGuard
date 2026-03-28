import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCoordinates } from '../utils/airportCoordinates.js';
import { useLanguage } from '../context/LanguageContext.jsx';

// Fix for default Leaflet marker icons not showing in bundle
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function FlightMap({ origin, destination, riskColor }) {
    const { t } = useLanguage();
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const originCoords = getCoordinates(origin);
        const destCoords = getCoordinates(destination);

        // Initialize map if it doesn't exist
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                zoomControl: false,
                scrollWheelZoom: false
            }).setView([20.5937, 78.9629], 5);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO'
            }).addTo(mapInstance.current);
        }

        const map = mapInstance.current;

        // Clear existing layers (except tile layer)
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        if (originCoords && destCoords) {
            // Add markers
            L.marker(originCoords, { icon: originIcon })
                .bindPopup(`<strong style="color: #1e293b;">${t('departure')}: ${origin}</strong>`)
                .addTo(map);

            L.marker(destCoords, { icon: destIcon })
                .bindPopup(`<strong style="color: #1e293b;">${destination}</strong>`)
                .addTo(map);

            // Add polyline
            const polyline = L.polyline([originCoords, destCoords], {
                color: riskColor || '#38bdf8',
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 10',
                className: 'animated-flight-path'
            }).addTo(map);

            // Fit bounds
            map.fitBounds(polyline.getBounds(), { padding: [50, 50], animate: true });
        }

        // Cleanup on unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [origin, destination, riskColor, t]);

    return (
        <div style={{
            height: '350px',
            width: '100%',
            borderRadius: '14px',
            overflow: 'hidden',
            border: `1px solid rgba(255,255,255,0.08)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
        }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#0a0a0a' }} />
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
                pointerEvents: 'none',
                zIndex: 1000
            }} />
        </div>
    );
}
