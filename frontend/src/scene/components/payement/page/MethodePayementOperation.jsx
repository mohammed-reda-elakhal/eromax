import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../payement.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import RecData from '../../../../data/reclamation.json';
import Title from '../../../global/Title';
import MethodePayementForm from '../components/MethodePayementForm';


function MethodePayementOperation() {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState(RecData);

    const handleEtatChange = (record) => {
        const updatedData = data.map(item => 
            item.code_suivi === record.code_suivi ? { ...item, etat: true } : item
        );
        setData(updatedData);
    };

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
                        <Title nom='Notification' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <MethodePayementForm/>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MethodePayementOperation;
