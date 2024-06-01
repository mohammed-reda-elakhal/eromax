import React, { useContext } from 'react'
import Menubar from '../global/Menubar'
import Topbar from '../global/Topbar'
import './dashboard.css'
import { ThemeContext } from '../ThemeContext'


function HomeDashboard() {
    const { theme, toggleTheme } = useContext(ThemeContext);
  return (
        <div className='page-dashboard'>
            <Menubar/>
            <main className="page-main">
                <Topbar/>
                <div 
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    home page
                    <img src="/image/logo.png" alt="" />
                    <img src="/image/logo.png" alt="" />
                    <img src="/image/logo.png" alt="" />
                    <img src="/image/logo.png" alt="" />
                </div>
            </main>
        </div>
  )
}

export default HomeDashboard