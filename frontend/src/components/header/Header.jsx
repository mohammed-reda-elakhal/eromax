import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown } from 'semantic-ui-react'
import { TikTokOutlined ,  YoutubeOutlined  , FacebookOutlined , InstagramOutlined , PhoneFilled , MailFilled , UserOutlined , MenuOutlined} from '@ant-design/icons';
import Navbar from './NavBar';
import './header.css'

const languageOptions = [
    { key: 'English', text: 'English', value: 'English' },
    { key: 'French', text: 'French', value: 'French' },
]

function Header() {
    const [languageSelected, setLanguageSelected] = useState('Select Language')
    const [isSticky, setSticky] = useState(false);
    const [toogleMenu , setToggleMenu] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) { // Change 100 to the scroll threshold where you want the header to become sticky
                setSticky(true);
            } else {
                setSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    useEffect(() => {
        // Retrieve the selected language from localStorage on component mount
        const savedLanguage = localStorage.getItem('selectedLanguage')
        if (savedLanguage) {
            setLanguageSelected(savedLanguage)
        }
    }, [])

    const openMenu = ()=>{
        setToggleMenu(prev => !prev)
    }

    const handleLanguageChange = (e, { value }) => {
        setLanguageSelected(value)
        // Save the selected language to localStorage
        localStorage.setItem('selectedLanguage', value)
    }

    return (
        <header className={`header ${isSticky ? 'sticky' : ''}`}>
            <div className="header-top">
                <div className="header-top-info">
                    <a href='#'><MailFilled /> support@eromax.com</a>
                    <a href='#'><PhoneFilled /> +212 5 06 63 32 25</a>
                </div>
                <div className="header-top-sm">
                    <Link className="header-top-sm-link">
                        <TikTokOutlined />
                    </Link>
                    <Link className="header-top-sm-link">
                        <FacebookOutlined />
                    </Link>
                    <Link className="header-top-sm-link">
                        <InstagramOutlined />
                    </Link>
                    <Link className="header-top-sm-link">
                        <YoutubeOutlined />
                    </Link>
                </div>
            </div>
            <div className="header-bottom">
                <div className="toggle-menu" onClick={openMenu}>
                    <MenuOutlined/>
                </div>
                <Navbar 
                    toogleMenu={toogleMenu} 
                    setToggleMenu={setToggleMenu} 
                    languageOptions={languageOptions} 
                    languageSelected={languageSelected} 
                    handleLanguageChange={handleLanguageChange} 
                />
                <Link to='/' className="header-bottom-logo">
                    <img src="/image/logo_2.png" alt="" />
                </Link>
                <div className="header-bottom-links">
                    <Link to={`/register`} className="header-bottom-link">
                        Devenir Client
                    </Link>
                    <Link to={`/register/livreur`} className="header-bottom-link">
                        Devenir Livreur
                    </Link>
                    <Link to={`/login`} className="header-bottom-link">
                        Connexion
                    </Link>
                </div>
                <Link to="/login" className='header-bottom-icon-login-link'>
                    <UserOutlined/>
                </Link>
            </div>
        </header>
    )
}

export default Header
