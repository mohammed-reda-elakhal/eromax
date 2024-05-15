import React from 'react'
import HeaderTop from './HeaderTop'
import './header.css'
import HeaderBottom from './HeaderBottom'

function Header() {
  return (
    <div className='header'>
        <HeaderTop/>
        <HeaderBottom />
    </div>
  )
}

export default Header