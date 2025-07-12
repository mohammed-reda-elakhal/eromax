import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../facture.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import FactureLivreurTable from '../components/FactureLivreurTable';
import FactureLivreurGroupe from '../components/FactureLivreurGroupe';
import { useParams } from 'react-router-dom';


const onChange = (key) => {
    console.log(key);
  }; 


function FactureLivreur() {
    const { theme } = useContext(ThemeContext);
    const {id} = useParams();

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
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        { id ? <FactureLivreurTable  theme={theme} id={id}/> : <FactureLivreurGroupe/> }
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FactureLivreur;
