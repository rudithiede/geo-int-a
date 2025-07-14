import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const lng = 18.4241;
  const lat = -33.9249;
  const zoom = 14;
  const API_KEY = '3WbrRFomAJfm2sX1zUri';

useEffect(() => {
  if (map.current) return; // stops map from intializing more than once

  map.current = new maplibregl.Map({
    container: mapContainer.current,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
    center: [lng, lat],
    zoom: zoom
  });
  map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
}, [API_KEY, lng, lat, zoom]);

  return (
  <div className="map-wrap">
    <div ref={mapContainer} className="map" />
  </div>
  );
}
