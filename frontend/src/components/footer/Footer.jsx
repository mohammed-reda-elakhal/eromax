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
                <Link className='footer-link' to="/register">
                    Devenir Client
                </Link>
                <Link className='footer-link' to="/register/livreur">
                    Devenir Livreur
                </Link>
                <Link className='footer-link' to="/login">
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
                        <Link  className='footer-icon' to={`https://api.whatsapp.com/send?phone=212630087302`}>
                            <FaWhatsapp />
                        </Link>
                        <Link  className='footer-icon' to={`https://web.facebook.com/profile.php?id=61561358108705`}>
                            <FaFacebook/>
                        </Link>
                        <Link  className='footer-icon' to={`https://www.instagram.com/eromax.ma/profilecard/?igsh=MTg0bDQ5ZmlpZDVraw==`}>
                            <FaInstagram />
                        </Link>
                        <Link  className='footer-icon' to={`https://www.tiktok.com/@eromax.ma?_t=8sBRoCXyCCz&_r=1`}>
                            <FaTiktok/>
                        </Link>
                    </div>
            </div>
        </div>
        <div className='footer-copyright'>
            <p>
                copyright @ Créer par 
                <a 
                href="https://www.mohammedreda.site/" 
                target="_blank" 
                rel="noopener noreferrer"
                >
                    Mohammed Reda
                </a>
            </p>
        </div>

        
    </footer>
  )
}

export default Footer