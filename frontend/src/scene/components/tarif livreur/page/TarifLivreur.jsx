import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { useNavigate } from 'react-router-dom';
import TarifLivreurTable from '../components/TarifLivreurTable';


const TarifLivreur = () => {
    const { theme } = useContext(ThemeContext);

  
  
    const navigate = useNavigate();



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
                        <Title nom='Tarif Livreur' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                            padding: '20px',
                        }}
                    >
                        <TarifLivreurTable/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TarifLivreur;
