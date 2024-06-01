import React from 'react'
import { Link } from 'react-router-dom'
import {CloseOutlined} from '@ant-design/icons';
import { Dropdown } from 'semantic-ui-react'

function Navbar({languageOptions , languageSelected , handleLanguageChange , setToggleMenu , toogleMenu}) {
    const Menu = ()=>{
        setToggleMenu(prev => !prev)
    }
  return (
    <div className={`navbar ${toogleMenu ? 'open' : ''}`}>
        <div className={`navbar-header`}>
            <img src="/image/logo.png" alt=""  style={{width:"50px"}}/>
            <div className="close-navbar-icon" onClick={Menu}>
                <CloseOutlined/>
            </div>
        </div>
        <div className="navbar-groupe-link">
            <Link className="navbar-link">
                Accueil
            </Link>
            <Link className="navbar-link">
                A propos
            </Link>
            <Link className="navbar-link">
                Service
            </Link>
            <Link className="navbar-link">
                Contact
            </Link>
            <Link className="navbar-link">
                Tarif
            </Link>
        </div>
        <div className="navbar-footer">
            <Link to={`/register`} className="header-bottom-link">
                Devenir Client
            </Link>
            <Link to={`/login`} className="header-bottom-link">
                Espace Client
            </Link>
            <Dropdown
                button
                className='icon'
                floating
                labeled
                icon='world'
                options={languageOptions}
                search
                text={languageSelected}
                onChange={handleLanguageChange}
            />
        </div>
    </div>
  )
}

export default Navbar