import React, { useContext, useState } from 'react';
import '../scan.css';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Row, Col, Card } from 'antd';
import { CarOutlined, CheckCircleOutlined, DeliveredProcedureOutlined, SearchOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdDeliveryDining, MdFeedback } from "react-icons/md";
import { IoLockClosed } from 'react-icons/io5';
import { toast } from 'react-toastify';

const Scan = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useSelector(state => state.auth);

    // Définir les données des cartes en fonction du rôle de l'utilisateur
    const adminCardData = [
        { name: 'Ramassée', icon: <CarOutlined /> },
        { name: 'Expediée', icon: <MdDeliveryDining /> },
        { name: 'En Retour', icon: <MdFeedback /> },
        { name: 'Fermée', icon: <IoLockClosed /> },
        { name: 'Recherche', icon: <SearchOutlined /> },
    ];

    const livreurCardData = [
        { name: 'Reçu', icon: <CheckCircleOutlined /> },
        { name: 'Mise en Distribution', icon: <DeploymentUnitOutlined /> },
        { name: 'Livrée', icon: <DeliveredProcedureOutlined /> },
        { name: 'Recherche', icon: <SearchOutlined /> },
    ];

    // Déterminer quelles données de cartes utiliser en fonction du rôle
    const isAdmin = user?.role === 'admin';
    const cardData = isAdmin ? adminCardData : livreurCardData;

    const [selectedCard, setSelectedCard] = useState(null);
    const navigate = useNavigate();

    // Fonction pour gérer la sélection d'une carte
    const handleSelect = (name) => {
        setSelectedCard(name);
    };

    // Fonction pour gérer la navigation en fonction de la carte sélectionnée
    const handleNextStep = () => {
        if (selectedCard) {
            if (selectedCard === "Recherche") {
                navigate(`/dashboard/scan/recherche`);
            } else {
                navigate(`/dashboard/scan/statu/${selectedCard}`);
            }
        } else {
            toast.warn("Veuillez sélectionner une carte pour procéder.");
        }
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
                        <Title nom='Scan Colis' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                            padding: '20px',
                        }}
                    >
                        <h4 style={{
                            color: theme === 'dark' ? '#fff' : '#002242',
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>Scan</h4>
                        <div style={{ padding: '20px', position: 'relative' }}>
                            <Row gutter={[16, 16]} justify="center">
                                {cardData.map((card) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={card.name}>
                                        <Card
                                            hoverable
                                            onClick={() => handleSelect(card.name)}
                                            style={{
                                                borderColor: selectedCard === card.name ? '#1890ff' : (theme === 'dark' ? '#434343' : '#f0f0f0'),
                                                borderWidth: selectedCard === card.name ? 2 : 1,
                                                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: 30,
                                                    color: selectedCard === card.name ? '#1890ff' : (theme === 'dark' ? '#fff' : '#000'),
                                                    transition: 'color 0.3s ease'
                                                }}>
                                                    {card.icon}
                                                </div>
                                                <p style={{
                                                    color: theme === 'dark' ? '#fff' : '#000',
                                                    margin: '8px 0 0 0',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>{card.name}</p>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Button
                                type="primary"
                                onClick={handleNextStep}
                                style={{
                                    marginTop: '20px',
                                    backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                                    borderColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                                    color: '#fff',
                                }}
                            >
                                Étape Suivante
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Scan;
