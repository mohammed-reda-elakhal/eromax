import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ProduitTable from '../components/ProduitTable';
import '../stock.css'

function ProduitList() {
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
                    <Title nom='List Produit' />
                    <Link to={`/dashboard/ajouter-produit`} className='btn-dashboard'>
                        <PlusCircleFilled style={{marginRight:"8px"}} />
                        Ajouter Produit
                    </Link>
                </div>
                <div
                    className="content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                    }}
                >
                    <h4>List Produit</h4>
                    <ProduitTable  theme={theme}/>
                </div>
            </div>
        </main>
    </div>
  )
}

export default ProduitList