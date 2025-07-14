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

    onClick() {
        new maplibregl.Marker({color: 'red'})
          .setLngLat([lng + (getRandomFraction()/100), lat + (getRandomFraction()/100)])
          .addTo(this.map);
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
