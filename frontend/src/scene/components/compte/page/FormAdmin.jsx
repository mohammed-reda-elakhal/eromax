import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../compte.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { useParams } from 'react-router-dom';
import TeamFormUpdate from '../components/TeamFormUpdate';
import AdminFormUpdate from '../components/AdminFormUpdate';


 

function FormAdmin() {
    const { theme } = useContext(ThemeContext);
    const {id} = useParams()

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
                        <h4>Gestion des utilisateurs</h4>
                        <AdminFormUpdate />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FormAdmin;
