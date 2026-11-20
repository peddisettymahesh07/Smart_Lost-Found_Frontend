import React, { useEffect, useRef } from 'react';

export const LeafletMap = ({
  center = [37.7749, -122.4194],
  zoom = 12,
  markers = [],
  radiusKm = null,
  onMapClick = null,
  height = '420px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    // Check if Leaflet L is available globally or can be loaded
    const initMap = () => {
      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        if (onMapClick) {
          map.on('click', (e) => {
            onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
          });
        }
      } else {
        mapInstanceRef.current.setView(center, zoom);
      }

      // Update markers
      if (markersLayerRef.current && L) {
        markersLayerRef.current.clearLayers();

        const lostIcon = L.divIcon({
          className: 'custom-map-pin lost-pin',
          html: `<div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="transform: rotate(45deg); color: #fff; font-size: 11px; font-weight: bold;">L</span></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
          popupAnchor: [0, -24],
        });

        const foundIcon = L.divIcon({
          className: 'custom-map-pin found-pin',
          html: `<div style="background-color: #0d9488; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="transform: rotate(45deg); color: #fff; font-size: 11px; font-weight: bold;">F</span></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
          popupAnchor: [0, -24],
        });

        markers.forEach((m) => {
          if (m.latitude && m.longitude) {
            const isLost = m.item_type === 'lost';
            const icon = isLost ? lostIcon : foundIcon;
            const marker = L.marker([parseFloat(m.latitude), parseFloat(m.longitude)], { icon });

            const popupContent = `
              <div style="font-family: sans-serif; min-width: 170px;">
                <div style="font-weight: 700; color: ${isLost ? '#dc2626' : '#0d9488'}; font-size: 0.72rem; text-transform: uppercase;">
                  ${isLost ? '🔴 Lost Report' : '🟢 Found Item'}
                </div>
                <div style="font-size: 0.95rem; font-weight: 600; margin: 3px 0; color: #0f172a;">${m.item_title || m.area}</div>
                <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">📍 ${m.area}, ${m.city}</div>
                ${m.distance_km !== undefined ? `<div style="font-size: 0.78rem; font-weight: 600; color: #2563eb; margin-bottom: 6px;">Distance: ~${m.distance_km} km away</div>` : ''}
                <a href="/items/${m.item_type}/${m.item_id}" style="display: inline-block; background-color: #1e3a8a; color: #fff; text-decoration: none; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">View Details &rarr;</a>
              </div>
            `;
            marker.bindPopup(popupContent);
            markersLayerRef.current.addLayer(marker);
          }
        });
      }

      // Radius circle
      if (mapInstanceRef.current && L) {
        if (circleRef.current) {
          mapInstanceRef.current.removeLayer(circleRef.current);
          circleRef.current = null;
        }
        if (radiusKm && center) {
          circleRef.current = L.circle(center, {
            radius: radiusKm * 1000,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 2,
          }).addTo(mapInstanceRef.current);
        }
      }
    };

    // If Leaflet is not yet loaded, dynamically append Leaflet CSS and JS
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Do not destroy map instantly to preserve state during fast tab switches
    };
  }, [center, zoom, markers, radiusKm]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        zIndex: 1,
      }}
    />
  );
};
