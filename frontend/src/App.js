import React, { useState } from 'react';
import Map from './components/map.js';
import Navbar from './components/navbar.js';
import './App.css';

function App() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [navbarText, setNavbarText] = useState('Content');

  return(
    <div className="App">
      {showNavbar && <Navbar setShowNavbar={setShowNavbar} text={navbarText} />}
      <Map setShowNavbar={setShowNavbar} setNavbarText={setNavbarText} />
    </div>
  )
}

export default App;