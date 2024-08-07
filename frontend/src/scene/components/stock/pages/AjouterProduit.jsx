import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Link } from 'react-router-dom';
import ProduitTable from '../components/ProduitTable';
import { FaListUl } from "react-icons/fa";
import AjouterProduitForm from '../components/AjouterProduitForm';


function AjouterProduit() {
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
                    <Title nom='Ajouter Nouveau Produit' />
                    <Link to={`/dashboard/list-produit`} className='btn-dashboard'>
                        <FaListUl style={{marginRight:"8px"}} />
                        List Produit
                    </Link>
                </div>
                <div
                    className="content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                    }}
                >
                    <h4>Ajouter Produit</h4>
                    <AjouterProduitForm theme={theme} />
                </div>
            </div>
        </main>
    </div>
  )
}

export default AjouterProduit