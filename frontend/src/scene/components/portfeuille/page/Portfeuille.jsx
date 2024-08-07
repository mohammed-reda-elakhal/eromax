import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { FaDownload } from "react-icons/fa";
import '../portfeuille.css'
import SoldeCart from '../components/SoldeCart';
import Solde from '../components/Solde';

function Portfeuille() {
    const { theme } = useContext(ThemeContext);
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
                          <Title nom='Portfeuille' />
                          
                      </div>
                      <div
                          className="content"
                          style={{
                              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                          }}
                      >
                          <Solde theme={theme}/>
                      </div>
                  </div>
              </main>
          </div>
    )
  }

export default Portfeuille