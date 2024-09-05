import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Input, Tooltip, Select, Col, Row , Checkbox } from 'antd';
import { MdOutlineWidgets } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addColis, createColis } from '../../../../redux/apiCalls/colisApiCalls';
import { toast } from 'react-toastify';
const { TextArea } = Input;


const formatNumber = (value) => new Intl.NumberFormat().format(value);
const NumericInput = (props) => {
    const { value, onChange } = props;
    const handleChange = (e) => {
        const { value: inputValue } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
            onChange(inputValue);
        }
    };

    const handleBlur = () => {
        let valueTemp = value;
        if (value.charAt(value.length - 1) === '.' || value === '-') {
            valueTemp = value.slice(0, -1);
        }
        onChange(valueTemp.replace(/0*(\d+)/, '$1'));
    };
    const title = value ? (
        <span className="numeric-input-title">{value !== '-' ? formatNumber(Number(value)) : '-'}</span>
    ) : (
        'Tél Exemple : 0655124822 '
    );
    return (
        <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
            <Input
                {...props}
                size="large"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Numéro"
                maxLength={10}
                prefix={
                    <PhoneOutlined
                        style={{
                            color: 'rgba(0,0,0,.25)',
                        }}
                    />
                }
                suffix={
                    <Tooltip title="Entrer Numéro de telephone de distinataire">
                        <InfoCircleOutlined
                            style={{
                                color: 'rgba(0,0,0,.45)',
                            }}
                        />
                    </Tooltip>
                }
            />
        </Tooltip>
    );
};

const villes = [
    { id: 1, name: 'Sale' },
    { id: 2, name: 'Rabat' },
];
const ColisTypes = [
    { id: 1, name: 'Colis Simple' },
    { id: 2, name: 'Colis du Stock' },
];

const ColisOuvrir = [
    { id: 1, name: 'Ouvrir Colis' , value:true },
    { id: 2, name: 'Ne pas Ouvrir Colis' , value : false },
];


function ColisForm({ theme , type}) {
    const [nom, setNom] = useState('');
    const [tele, setTele] = useState('');
    const [ville, setVille] = useState('');
    const [adress, setAdress] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [prix, setPrix] = useState('');
    const [produit, setProduit] = useState('');
    const [colisType , setColisType] = useState(ColisTypes[0].name)
    const [remplaceColis , setRemplaceColis] = useState(true)
    const [ouvrirColis , setOuvrirColis] = useState(true)

    const navigate = useNavigate(); 
    const dispatch = useDispatch();
  

    useEffect(()=>{
        if(type === 'simple'){
            setColisType(ColisTypes[0].name)
        }else if(type === 'stock'){
            setColisType(ColisTypes[1].name)
        }
    },[type])

    const handleChangeVille = (value) => {
        setVille(value);
    };
    const handleChangeColisType = (value) => {
        setColisType(value);
        if (value === ColisTypes[0].name) {
            navigate('/dashboard/ajouter-colis/simple');
        } else if (value === ColisTypes[1].name) {
            navigate('/dashboard/ajouter-colis/stock');
        }
    };

    const handeleRemplace = (e) => {
        setRemplaceColis(e.target.checked)
    };
    const handeleOuvrir = (value) => {
        setOuvrirColis(value)
    };
    const handleCleanData = ()=>{
        setNom('')
        setTele('')
        setVille('')
        setAdress('')
        setCommentaire('')
        setPrix('')
        setProduit('')
        setColisType(ColisTypes[0].name)
        setRemplaceColis(false)
    }

    const darkStyle = {
        backgroundColor: 'transparent',
        color: '#fff',
        borderColor: 'gray',
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const colis = {
            nom,
            tele,
            ville,
            adresse : adress,
            commentaire,
            prix,
            nature_produit :produit,
            ouvrir :ouvrirColis,
            is_remplace : remplaceColis,
        };
        dispatch(createColis(colis))
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="colis-form-header">
                <button>
                    <MdOutlineWidgets/>
                    Nouveau Colis
                </button>
                <Select
                    options={ColisTypes.map((option) => ({
                        value: option.name,
                        label: option.name,
                    }))}
                    className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                    value={colisType}
                    onChange={handleChangeColisType}
                    placeholder="type de colis"
                />
                <Checkbox 
                    onChange={handeleRemplace}
                    style={theme === 'dark' ? darkStyle : {}}
                    value={remplaceColis}
                >
                    Colis à remplacer
                    <p>
                        (Le colis sera remplacer avec l'ancien a la livraison.)
                    </p>
                </Checkbox>
                <Select
                    options={ColisOuvrir.map((option) => ({
                        value: option.value,
                        label: option.name,
                    }))}
                    className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                    value={ouvrirColis}
                    onChange={handeleOuvrir}
                    placeholder="Type de Colis"
                />
            </div>
            <div className="colis-form-inputs">
                <Row gutter={16}>
                    <Col span={12}>
                        <div className="colis-form-input">
                            <label htmlFor="nom">Nom <span className="etoile">*</span></label>
                            <Input
                                placeholder="Nom"
                                size="large"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                style={theme === 'dark' ? darkStyle : {}}
                                prefix={
                                    <UserOutlined
                                        style={{
                                            color: 'rgba(0,0,0,.25)',
                                        }}
                                    />
                                }
                                suffix={
                                    <Tooltip title="Entrer nom de destinataire">
                                        <InfoCircleOutlined
                                            style={{
                                                color: 'rgba(0,0,0,.45)',
                                            }}
                                        />
                                    </Tooltip>
                                }
                            />
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="colis-form-input">
                            <label htmlFor="tele">Telephone <span className="etoile">*</span></label>
                            <NumericInput
                                value={tele}
                                onChange={setTele}
                                style={theme === 'dark' ? darkStyle : {}}
                            />
                        </div>
                    </Col>
                </Row>

                <div className="colis-form-input">
                    <label htmlFor="ville">Ville <span className="etoile">*</span></label>
                    <Select
                        options={villes.map((option) => ({
                            value: option.name,
                            label: option.name,
                        }))}
                        className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
                        value={ville}
                        onChange={handleChangeVille}
                        placeholder="Ville"
                    />
                </div>

                <div className="colis-form-input">
                    <label htmlFor="adress">Adress <span className="etoile">*</span></label>
                    <TextArea
                        size="large"
                        showCount
                        maxLength={300}
                        value={adress}
                        onChange={(e) => setAdress(e.target.value)}
                        placeholder="Votre adress"
                        style={theme === 'dark' ? darkStyle : {}}
                    />
                </div>

                <div className="colis-form-input">
                    <label htmlFor="commentaire">Commentaire </label>
                    <TextArea
                        size="large"
                        showCount
                        maxLength={300}
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Commentaire , ( Autre Numéro de telephone , date de livraison ... ) "
                        style={theme === 'dark' ? darkStyle : {}}
                    />
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <div className="colis-form-input">
                            <label htmlFor="prix">Prix <span className="etoile">*</span></label>
                            <Input
                                placeholder="Prix"
                                size="large"
                                value={prix}
                                onChange={(e) => setPrix(e.target.value)}
                                style={theme === 'dark' ? darkStyle : {}}
                                prefix={
                                    <UserOutlined
                                        style={{
                                            color: 'rgba(0,0,0,.25)',
                                        }}
                                    />
                                }
                                suffix={
                                    <Tooltip title="Entrer le prix de produit">
                                        <InfoCircleOutlined
                                            style={{
                                                color: 'rgba(0,0,0,.45)',
                                            }}
                                        />
                                    </Tooltip>
                                }
                            />
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="colis-form-input">
                            <label htmlFor="produit">Nature de produit </label>
                            <Input
                                placeholder="Nature de produit"
                                size="large"
                                value={produit}
                                onChange={(e) => setProduit(e.target.value)}
                                style={theme === 'dark' ? darkStyle : {}}
                                prefix={
                                    <UserOutlined
                                        style={{
                                            color: 'rgba(0,0,0,.25)',
                                        }}
                                    />
                                }
                                suffix={
                                    <Tooltip title="Entrer la nature de produit">
                                        <InfoCircleOutlined
                                            style={{
                                                color: 'rgba(0,0,0,.45)',
                                            }}
                                        />
                                    </Tooltip>
                                }
                            />
                        </div>
                    </Col>
                </Row>
                <button 
                    className='btn-dashboard'
                    style={{
                        marginTop:"12px"
                    }}
                    type='submit'
                >
                    {
                        type === 'simple' ?
                        'Confirmer & Demande Ramassage' 
                        :
                        'Confirmer & Choisir Produit'
                    }
                </button>
            </div>
        </form>
    );
}

export default ColisForm;