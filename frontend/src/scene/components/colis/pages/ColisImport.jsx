import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { FaDownload } from "react-icons/fa";
import ImportFileColis from '../components/ImportFileColis';


function ColisImport() {
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
                        <Title nom='Import Colis' />
                        <a href="/colis_import_example.xlsx" download>Télécharger l'exemple</a>

                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <ImportFileColis theme={theme} />
                    </div>
                </div>
            </main>
        </div>
  )
}

export default ColisImport