import React from 'react';
import './navbar.css';

export default function Navbar({setShowNavbar, text}){
  const handleHideClick = () => {
    setShowNavbar(false);
  }

  return (
    <div className="heading">
    <div dangerouslySetInnerHTML={{ __html: text }} />
    <button className="toggle-button" onClick={handleHideClick}>
      x
    </button>
    </div>
  );
}