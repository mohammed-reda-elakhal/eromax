import React, { useContext } from 'react';
import Menubar from '../global/Menubar';
import Topbar from '../global/Topbar';
import './dashboard.css';
import { ThemeContext } from '../ThemeContext';

function HomeDashboard() {
    const { theme } = useContext(ThemeContext);

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className={`page-main ${theme}`}>
                <Topbar />
                <div className={`page-content ${theme}`}>
                    home page
                    <img src="/image/logo.png" alt="logo" />
                    <img src="/image/logo.png" alt="logo" />
                    <img src="/image/logo.png" alt="logo" />
                    <img src="/image/logo.png" alt="logo" />
                </div>
            </main>
        </div>
    );
}

export default HomeDashboard;
