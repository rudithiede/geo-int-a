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

  async function addStoredPoints() {
    console.log('Adding stored points...');
    try {
          const response = await fetch('http://localhost:80/locations/geojson');
          console.log('Response:', response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Data:', data);
          var lats = [];
          var lons = [];
          for (const feature of data.features) {
            const { coordinates } = feature.geometry;
            lats.push(coordinates[1]);
            lons.push(coordinates[0]);
            const name = feature.properties.name || 'Unnamed Location';

            const marker = new maplibregl.Marker({color: 'blue'})
              .setLngLat(coordinates)
              .addTo(map.current);
            
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`<b>Name:</b> ${name}<br /><br /><b>Category:</b> ${feature.properties.category || 'N/A'}`);
            marker.setPopup(popup);
          }
          const bounds = [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
          map.current.fitBounds(bounds, {
            padding: 20
          });
          return data.features;
        } catch (error) {
          console.error('Error fetching locations:', error);
      }
  }

  // Define "show DB contents" button
  class ShowDBControl {
    onAdd(map) {
      this.map = map;
      this.container = document.createElement('button');
      this.container.className = 'maplibregl-ctrl';
      this.container.textContent = 'Load Table from Database';
      this.container.onclick = this.onClick.bind(this);
      return this.container;
    }

    onClick = async() => {
      console.log('Reading database...');
      try {
        const response = await fetch('http://localhost:80/locations');
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        alert(`Data: ${JSON.stringify(data)}`);
      } catch (error) {
        alert('Error fetching locations:', error);
      }
    }

    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
  }

  // Add the custom controls to the map
  const showDBControl = new ShowDBControl();
  map.current.addControl(showDBControl);
  map.current.addControl(new maplibregl.NavigationControl());

  // Load stored points from the database
  map.current.on('load', async () => {
    console.log('Map loaded, adding stored points...');
    await addStoredPoints();
  });



}, [API_KEY, lng, lat, zoom]);

  return (
  <div className="map-wrap">
    <div ref={mapContainer} className="map" />
  </div>
  );
}
