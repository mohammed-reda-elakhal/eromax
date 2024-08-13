import { Divider, Input, Select, Tooltip } from 'antd';
import React from 'react'
import { InfoCircleOutlined } from '@ant-design/icons';
import { MdBorderColor } from "react-icons/md";


const banqueType = [
    { id: 1, name: 'CIH' },
    { id: 2, name: 'Barid bank' },
];
function DemandeRetrait({theme}) {

    const darkStyle = {
        backgroundColor: 'transparent',
        color: '#fff',
        borderColor: 'gray',
    };
  return (
    <div className='demande-retrait'>
        <h1>
            <MdBorderColor/>
            Demande de Retrait
        </h1>
        <form action="">
            <div className="colis-form-input">
                <label htmlFor="montant">Montant <span className="etoile">*</span></label>
                <Input
                    placeholder="Montant"
                    size="large"
                    style={theme === 'dark' ? darkStyle : {}}
                    suffix={
                        <Tooltip title="Saiser le montant">
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
                    options={banqueType.map((option) => ({
                        value: option.name,
                        label: option.name,
                    }))}
                    className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                    placeholder="type de colis"
                />
            </div>
            <Divider/>
            <div className="message_retrait">
                <h3>Les frais de chaque demande de retrait (virement bancaire) sont</h3>
                <p>
                    À partir du 1er janvier 2022, la banque a commencé à déduire des frais  pour chaque virement bancaire et même pour les comptes de la même banque.
                    C'est pour cela nous avons commencé à réduire ces frais pour chaque virement bancaire.
                    Merci pour votre compréhension.
                </p>
            </div>
            <Divider/>
            <button 
                className='btn-dashboard'
                style={{
                    marginTop:"12px"
                }}
                type='submit'
            >
                Faire la demande
            </button>
        </form>

    </div>
  )
}

export default DemandeRetrait