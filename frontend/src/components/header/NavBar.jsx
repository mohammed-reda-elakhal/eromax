import React, { useEffect } from 'react'
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';

function NavBar({setToggleMenu}) {

  useEffect(() => {
    // Add smooth scrolling behavior
    const smoothScroll = (target) => {
      document.querySelector(target).scrollIntoView({
        behavior: 'smooth',
      });
    };

    // Attach click event listeners to navigation links
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        smoothScroll(target);
      });
    });
  }, []);

  return (
    <div className='navbar'>
        <div className="header-navbar">
            <img src="/image/logo.png" alt="" className='header-logo' style={{width:"150px"}}/>
            <IoClose size={30} onClick={()=>setToggleMenu(false)}/>
        </div>
        <ul>
            <li>
              <Link to='/' style={{textDecoration:"none" , color:"black"}}>
                Accueil
              </Link>
            </li>
            <li>
              <a href="#about" style={{textDecoration:"none" , color:"black"}}>
                Propos de Nous
              </a>
            </li>
            <li>
              <a href="#avantage" style={{textDecoration:"none" , color:"black"}}>
                Pourquoi Nous
              </a>
            </li>
            <li>
              <a href="#contact" style={{textDecoration:"none" , color:"black"}}>
                Contacts
              </a>
            </li>
            <li>
              <a href="#tarif" style={{textDecoration:"none" , color:"black"}}>
                Tarif
              </a>
            </li>
            <li>
              <Link to="/blog" style={{textDecoration:"none" , color:"black"}}>
                  Blog
              </Link>
            </li>
            <button>
              <Link to="/singup" style={{textDecoration:"none" , color:"white"}}>
                Devenir Client
              </Link>
            </button>
            <button>
              <Link to="/login" style={{textDecoration:"none" , color:"white"}}>
                Espace Client
              </Link>
            </button>
        </ul>
    </div>
  )
}

export default NavBar