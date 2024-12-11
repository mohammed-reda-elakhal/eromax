import { Divider, Input, Select, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { InfoCircleOutlined } from '@ant-design/icons';
import { MdBorderColor } from "react-icons/md";
import Cookies from 'js-cookie';
import { getPaymentsByClientId } from '../../../../redux/apiCalls/payementApiCalls'; // import the create action
import { createDemandeRetrait } from '../../../../redux/apiCalls/demandeRetraitApiCall';

function DemandeRetrait({ theme , setOpenWallet }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const store = JSON.parse(localStorage.getItem("store"));
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

        setOpenWallet(false);
    };

    const darkStyle = {
        backgroundColor: 'transparent',
        color: '#fff',
        borderColor: 'gray',
    };

    // Check if payements is an array and contains items
    const paymentOptions = Array.isArray(payements) && payements.length > 0
        ? payements.map((option) => ({
            value: option._id,
            label: option?.idBank?.Bank,
        }))
        : []; // Return an empty array if no payments are available

    return (
        <div className='demande-retrait'>
            <h1>
                <MdBorderColor />
                Demande de Retrait
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="colis-form-input" style={{width:"100%"}}>
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
                <div className="colis-form-input" style={{width:"100%"}}>
                    <label htmlFor="banque">Banque <span className="etoile">*</span></label>
                    <Select
                        size="large"
                        value={selectedBank}
                        onChange={setSelectedBank}
                        options={paymentOptions}
                        className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                        placeholder={paymentOptions.length === 0 ? "Aucune méthode de paiement disponible" : "Sélectionner la banque"}
                        disabled={paymentOptions.length === 0} // Disable the select box if no options
                    />
                </div>
                <div 
                    className='notification_home'
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        marginTop:"16px"
                    }}
                >
                    Les frais de chaque demande de retrait (virement bancaire) sont:5.00MAD
                </div>
                <Divider />
                <button 
                    className='btn-dashboard'
                    style={{ marginTop: "12px" }}
                    type='submit'
                    disabled={paymentOptions.length === 0} // Disable submit button if no payment options
                >
                    Faire la demande
                </button>
            </form>
        </div>
    );
}

export default DemandeRetrait;
