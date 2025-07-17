import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

function getRandomFraction() {
    return Math.random() * 2 - 1; // Returns a random number between -1 and 1
}

function jsonToHtmlTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '<p>No data available</p>';
  }

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => `<th>${h}</th>`).join('');
  const bodyRows = data.map(item =>
    `<tr>${headers.map(h => `<td>${item[h] ?? ''}</td>`).join('')}</tr>`
  ).join('');

  return `
    <table border="1" cellpadding="5" cellspacing="0">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

export default function Map({ setShowNavbar, setNavbarText }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Save markers here
  const currentMarkers = useRef([]);

  const lng = 18.4241;
  const lat = -33.9249;
  const zoom = 12;
  const API_KEY = '3WbrRFomAJfm2sX1zUri';
  const toggleNavbar = () => {
    setShowNavbar(prev => !prev);
  };

  // Function to remove all markers
  function removeAllMarkers() {
    currentMarkers.current.forEach(marker => marker.remove());
    currentMarkers.current = []; // Clear the array
  }

  async function addStoredPoints() {
    console.log('Adding stored points...');

    try {
          removeAllMarkers(); // Clear existing markers before adding new ones
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

            currentMarkers.current.push(marker); // Save marker to currentMarkers array
            
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


  // Submission form state
  const [showForm, setShowForm] = useState(false);
  const initialFormData = {
    name: '',
    category: '',
    latitude: '',
    longitude: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Construct JSON
    const payload = {
      name: formData.name,
      category: formData.category,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };

    try {
      const response = await fetch('http://localhost:80/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      console.log('Submitted successfully!');

      await addStoredPoints(); // Re-fetch and display markers
      
      // Clear the form after successful submission
      setFormData(initialFormData);
      
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const [file, setFile] = useState(null);
  const handleCSVSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:80/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("Upload failed:", result);
      } else {
        console.log("Success:", result);
        await addStoredPoints(); // Re-fetch and display markers
      }
    } catch (err) {
      console.error("Error uploading CSV:", err);
    }
  };

class ShowFormControl {
  constructor(setShowForm) {
    this.setShowForm = setShowForm;
  }

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('button');
    this.container.className = 'maplibregl-ctrl';
    this.container.textContent = 'Add New POI';
    this.container.onclick = () => {
      this.setShowForm(prev => !prev);
    };
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

useEffect(() => {
  if (map.current) return; // stops map from intializing more than once

  setShowNavbar(false); // Hide navbar initially

  map.current = new maplibregl.Map({
    container: mapContainer.current,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
    center: [lng, lat],
    zoom: zoom
  });

  const showFormControl = new ShowFormControl(setShowForm);
  map.current.addControl(showFormControl, 'top-left');

  // Define "show DB contents" button
  class ShowDBControl {
    onAdd(map) {
      this.map = map;
      this.container = document.createElement('button');
      this.container.className = 'maplibregl-ctrl';
      this.container.textContent = 'View Database Table';
      this.container.onclick = this.onClick.bind(this);
      return this.container;
    }

    onClick = async() => {
      setShowNavbar(true); // Show navbar when button is clicked
      
      console.log('Reading database...');
      try {
        const response = await fetch('http://localhost:80/locations');
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Data: ${JSON.stringify(data)}`);

        const tableHtml = jsonToHtmlTable(data);
        setNavbarText(tableHtml); // Set the navbar text to the HTML table

      } catch (error) {
        console.log('Error fetching locations:', error);
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


      {showForm && (
  <form onSubmit={handleSubmit} className="map-form">
    <label>
      Name:<br />
      <input type="text" name="name" value={formData.name} onChange={handleChange} required />
    </label><br /><br />

    <label>
      Category (e.g. Library):<br />
      <input type="text" name="category" value={formData.category} onChange={handleChange} />
    </label><br /><br />

    <label>
      Latitude (e.g. -26.02):<br />
      <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required />
    </label><br /><br />

    <label>
      Longitude (e.g. 28.55):<br />
      <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required />
    </label><br /><br />

    <button type="submit">Submit</button>
  </form>
)}

  <form onSubmit={handleCSVSubmit} className='map-csv-form'>
  <input
    type="file"
    accept=".csv"
    onChange={(e) => setFile(e.target.files[0])}
  />
  <button type="submit">Upload New Points (CSV)</button>
</form>

  </div>



  );
}
