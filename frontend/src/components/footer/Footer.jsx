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
    <footer className='footer'
        style={mode === 'dark' ?   {background:'rgb(36, 36, 36)' } : {background:"whitesmoke"}}
    >
        <div className="footer-header">
            <p>It is the right time to start your partnership <br/> with EROMAX.MA and grow your business</p>
            <strong>0808599663</strong>
        </div>
        <div className="footer-main">
            <div className="footer-links">
                    <h2 className='footer-title-section'>Links</h2>
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
            <div className="footer-lang">
                <h2 className='footer-title-section'>CHANGE LANGUAGE</h2>
                <div className="footer-traduction">
                    <button className='btn-select-lang' onClick={()=>setToggleLang(prev => !prev)}>
                        <span>{lang}</span>
                        <IoIosArrowDown />
                    </button>
                    {
                    toggleLang && (
                        <>
                            <button className='btn-lang' onClick={()=>{
                                i18n.changeLanguage("ar")
                                setToggleLang(prev => !prev)
                                setLang('العربية')
                            }}>
                                العربية
                            </button>
                            <button className='btn-lang' onClick={()=>{
                                i18n.changeLanguage("en")
                                setToggleLang(prev => !prev)
                                setLang('English')
                            }}>
                                English
                            </button>
                        </>
                        )
                    }
                </div>
            </div>
            <div className="footer-links">
                <h2 className='footer-title-section'>Links</h2>
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
                        style={mode === 'dark' ?   {color:'whitesmoke' } : {color:"black"}}
                    >
                        EROMAX.MA works with speed and agility and ensures seamless end-to-end distribution with passion and commitment.
                    </p>
                    <div className="footer-icons">
                        <FaWhatsapp className='footer-icon' />
                        <FaFacebook className='footer-icon'/>
                        <FaInstagram className='footer-icon'/>
                        <FaTiktok className='footer-icon'/>
                    </div>
            </div>
        </div>
        <div className='footer-copyright'>
            <p>copyright @ Créer par Mohammed Reda</p>         
        </div>
        
    </footer>
  )
}

export default Footer