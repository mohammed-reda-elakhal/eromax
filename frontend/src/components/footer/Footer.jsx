import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import i18n from 'i18next';
import { IoIosArrowDown } from "react-icons/io";
import { FaWhatsapp , FaFacebook , FaInstagram , FaTiktok } from "react-icons/fa";
import './footer.css'


function Footer({handleChangeTheme , mode}) {
    const [lang , setLang] = useState('Language')
    const [toggleLang , setToggleLang] = useState(false)
  return (
    <footer className='footer'>
        <div className="footer-header">
            <p>It is the right time to start your partnership <br/> with EROMAX.MA and grow your business</p>
            <strong>0808599663</strong>
        </div>
        <div className="footer-main">
            <div className="footer-links">
                    <h2 className='footer-title-section'>Liens Rapide</h2>
                    <Link className='footer-link' to="">
                        Home
                    </Link>
                    <Link className='footer-link' to="">
                        About
                    </Link>
                    <Link className='footer-link' to="">
                        Service
                    </Link>
                    <Link className='footer-link' to="">
                        Tarif
                    </Link>
            </div>
            <div className="footer-links">
                <h2 className='footer-title-section'>Liens Rapide</h2>
                <Link className='footer-link' to="">
                    Devenir Client
                </Link>
                <Link className='footer-link' to="">
                    Espace Client
                </Link>
            </div>
            <div className="footer-info">
                    <img src="/image/logo.png" className='footer-logo' alt="" />
                    <p 
                        className="footer-info-text"
                    >
                        EROMAX.MA works with speed and agility and ensures seamless end-to-end distribution with passion and commitment.
                    </p>
                    <div className="footer-icons">
                        <Link  className='footer-icon'>
                            <FaWhatsapp />
                        </Link>
                        <Link  className='footer-icon'>
                            <FaFacebook/>
                        </Link>
                        <Link  className='footer-icon'>
                            <FaInstagram />
                        </Link>
                        <Link  className='footer-icon'>
                            <FaTiktok/>
                        </Link>
                    </div>
            </div>
        </div>
        <div className='footer-copyright'>
            <p>copyright @ Créer par <a href="https://www.mohammedreda.site/" blank >Mohammed Reda</a> </p>         
        </div>
        
    </footer>
  )
}

export default Footer