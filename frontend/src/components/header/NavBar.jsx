import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';

function NavBar({ setToggleMenu }) {

  // Function to handle smooth scrolling
  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth' // Smooth scrolling behavior
      });
      setToggleMenu(false); // Close the menu after clicking
    }
  };

  return (
    <div className="navbar">
      <div className="header-navbar">
        <img src="/image/logo.png" alt="" className="header-logo" style={{ width: '80px' }} />
        <IoClose size={30} onClick={() => setToggleMenu(false)} />
      </div>
      <ul>
        <li>
          <Link to="/" onClick={() => setToggleMenu(false)} style={{ textDecoration: 'none', color: 'black' }}>
            Accueil
          </Link>
        </li>
        <li>
          <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')} style={{ textDecoration: 'none', color: 'black' }}>
            Propos de Nous
          </a>
        </li>
        <li>
          <a href="#avantage" onClick={(e) => handleSmoothScroll(e, 'avantage')} style={{ textDecoration: 'none', color: 'black' }}>
            Pourquoi Nous
          </a>
        </li>
        <li>
          <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} style={{ textDecoration: 'none', color: 'black' }}>
            Contacts
          </a>
        </li>
        <li>
          <a href="#tarif" onClick={(e) => handleSmoothScroll(e, 'tarif')} style={{ textDecoration: 'none', color: 'black' }}>
            Tarif
          </a>
        </li>
        <li>
          <Link to="/blog" onClick={() => setToggleMenu(false)} style={{ textDecoration: 'none', color: 'black' }}>
            Blog
          </Link>
        </li>
          <Link className='button-link' to="/signup" onClick={() => setToggleMenu(false)} style={{ textDecoration: 'none', color: 'white' }}>
            Devenir Client
          </Link>
          <Link className='button-link' to="/login" onClick={() => setToggleMenu(false)} style={{ textDecoration: 'none', color: 'white' }}>
            Espace Client
          </Link>
      </ul>
    </div>
  );
}

export default NavBar;
