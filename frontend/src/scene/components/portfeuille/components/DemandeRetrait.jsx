import { Divider, Input, Select, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { InfoCircleOutlined } from '@ant-design/icons';
import { MdBorderColor } from "react-icons/md";
import Cookies from 'js-cookie';
import { getPaymentsByClientId } from '../../../../redux/apiCalls/payementApiCalls';// import the create action
import { createDemandeRetrait } from '../../../../redux/apiCalls/demandeRetraitApiCall';

function DemandeRetrait({ theme , setOpenWallet }) {
    const user = JSON.parse(Cookies.get('user'));
    const store = JSON.parse(Cookies.get('store'));
    const dispatch = useDispatch();
    const { payements } = useSelector((state) => state.payement);

    // State for form data
    const [montant, setMontant] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);

    useEffect(() => {
        const userId = user._id;
        dispatch(getPaymentsByClientId(userId));
    }, [dispatch]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!montant || !selectedBank) {
            return alert('Please fill in all required fields');
        }

        // Prepare data
        const demandeData = {
            id_store: store._id,
            id_payement: selectedBank,
            montant
        };

        // Dispatch the createDemandeRetrait action
        dispatch(createDemandeRetrait(demandeData));

         // Clear the form fields after submission
         setMontant('');          // Reset montant field
         setSelectedBank(null);   // Reset selectedBank field
         
         
        setOpenWallet(false)
    };

    const darkStyle = {
        backgroundColor: 'transparent',
        color: '#fff',
        borderColor: 'gray',
    };

    return (
        <div className='demande-retrait'>
            <h1>
                <MdBorderColor />
                Demande de Retrait
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="colis-form-input">
                    <label htmlFor="montant">Montant <span className="etoile">*</span></label>
                    <Input
                        placeholder="Montant"
                        size="large"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        style={theme === 'dark' ? darkStyle : {}}
                        suffix={
                            <Tooltip title="Saisir le montant">
                                <InfoCircleOutlined
                                    style={{
                                        color: 'rgba(0,0,0,.45)',
                                    }}
                                />
                            </Tooltip>
                        }
                    />
                </div>
                <div className="colis-form-input">
                    <label htmlFor="banque">Banque <span className="etoile">*</span></label>
                    <Select
                        size="large"
                        value={selectedBank}
                        onChange={setSelectedBank}
                        options={payements.map((option) => ({
                            value: option._id,
                            label: option?.idBank?.Bank,
                        }))}
                        className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                        placeholder="Sélectionner la banque"
                    />
                </div>
                <Divider />
                <button 
                    className='btn-dashboard'
                    style={{ marginTop: "12px" }}
                    type='submit'
                >
                    Faire la demande
                </button>
            </form>
        </div>
    );
}

export default DemandeRetrait;
