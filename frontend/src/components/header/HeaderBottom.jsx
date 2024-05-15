import React, { useState } from 'react'
import NavBar from './NavBar'
import { IoMenu , IoClose } from "react-icons/io5";

function HeaderBottom() {
    const [toggleMenu , setToggleMenu] = useState(false)
  return (
    <div className='header-bottom'>
        <div className="header-bottom-icon-close">
            <IoClose/>
        </div>
        <div className={`header-bottom-logo`}>
            <img src="/image/logo.png" alt="" className='header-logo' style={{width:"150px"}}/>
        </div>
        <div className={`header-bottom-navbar ${toggleMenu ? 'open' : ''}`}>
            <NavBar setToggleMenu={setToggleMenu}/>
        </div>
        <div 
            className="header-bottom-icon-menu"
            onClick={()=>setToggleMenu(prev=> !prev)}
        >
            <IoMenu/>
        </div>
    </div>
  )
}

export default HeaderBottom