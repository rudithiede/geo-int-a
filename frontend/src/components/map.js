import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

function getRandomFraction() {
    return Math.random() * 2 - 1; // Returns a random number between -1 and 1
}

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const lng = 18.4241;
  const lat = -33.9249;
  const zoom = 12;
  const API_KEY = '3WbrRFomAJfm2sX1zUri';

useEffect(() => {
  if (map.current) return; // stops map from intializing more than once

  map.current = new maplibregl.Map({
    container: mapContainer.current,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
    center: [lng, lat],
    zoom: zoom
  });

  // Add custom controls to the map
  class AddPointControl {
    onAdd(map) {
        this.map = map;
        this.container = document.createElement('button');
        this.container.className = 'maplibregl-ctrl';
        this.container.textContent = 'Add Point';
        this.container.onclick = this.onClick.bind(this);
        return this.container;
    }

    onClick = async() => {
      console.log('Adding point...');

        try {
          const response = await fetch('http://localhost:80/locations/geojson');
          console.log('Response:', response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Data:', data);
          for (const feature of data.features) {
            const { coordinates } = feature.geometry;
            const name = feature.properties.name || 'Unnamed Location';

            
            const marker = new maplibregl.Marker({color: 'blue'})
              .setLngLat(coordinates)
              .addTo(this.map);
            
            const popup = new maplibregl.Popup({ offset: 25 }).setText(name);
            marker.setPopup(popup);
          }
          return data.features;
        } catch (error) {
          console.error('Error fetching locations:', error);
      }
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
  }
  const addPointControl = new AddPointControl();
  map.current.addControl(addPointControl);

  map.current.addControl(new maplibregl.NavigationControl());

}, [API_KEY, lng, lat, zoom]);

  return (
  <div className="map-wrap">
    <div ref={mapContainer} className="map" />
  </div>
  );
}
