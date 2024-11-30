import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { FaDownload } from "react-icons/fa";
import Statistic from '../components/Statistic';
import Notification from '../components/Notification';
import '../dashboard.css'
import PromotionStore from '../components/PromotionStore';
import Mission from '../components/Mission';
import { useSelector } from 'react-redux';


function HomeDashboard() {
    const { theme } = useContext(ThemeContext);
    const { user } = useSelector((state) => ({
        user: state.auth.user,
    }));
  return (
    <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div className="page-content-header">
                        <Title nom='Accuiel' />
                        
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        
                        {
                            /**
                             *  
                        <Notification theme={theme}/>
                        {
                            user?.role ==="admin" || user?.role ==="livreur" ? 
                            <Mission theme={theme}/>
                            :""
                        }
                             * 
                             */
                        }
                       
                        
                        <Statistic theme={theme} />
                    </div>
                </div>
            </main>
        </div>
  )
}

export default HomeDashboard