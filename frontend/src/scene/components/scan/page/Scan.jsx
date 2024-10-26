import React, { useContext, useState } from 'react';
import '../scan.css';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Row, Col, Card } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, CheckCircleOutlined, DeliveredProcedureOutlined, SearchOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const Scan = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useSelector(state => state.auth);

    // Dynamic data for card content
    const cardData1 = [
        { name: 'Ramassée', icon: <CarOutlined /> },
        { name: 'Reçu', icon: <CheckCircleOutlined /> },
        { name: 'Mise en Distribution', icon: <DeploymentUnitOutlined /> },
        { name: 'Livrée', icon: <DeliveredProcedureOutlined /> },
        { name: 'Recherche', icon: <SearchOutlined /> },
    ];

    const [selectedCard, setSelectedCard] = useState(null);
    const navigate = useNavigate();

    // Function to handle card selection
    const handleSelect = (name) => {
        setSelectedCard(name);
    };

    // Function to handle navigation with parameters
    const handleNextStep = () => {
        if (selectedCard) {
            if(selectedCard === "Recherche"){
                navigate(`/dashboard/scan/recherche`)
            }else{
                navigate(`/dashboard/scan/statu/${selectedCard}`)
            }
        } else {
            toast.warn("Please select a card to proceed.");
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
                        <h4>Scan</h4>
                        <div style={{ padding: '20px', position: 'relative' }}>
                            <Row gutter={[16, 16]} justify="center">
                                {cardData1.map((card) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={card.name}>
                                        <Card
                                            hoverable
                                            onClick={() => handleSelect(card.name)}
                                            style={{
                                                borderColor: selectedCard === card.name ? '#1890ff' : '#f0f0f0',
                                                borderWidth: selectedCard === card.name ? 2 : 1,
                                            }}
                                        >
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 30, color: selectedCard === card.name ? '#1890ff' : '#000' }}>
                                                    {card.icon}
                                                </div>
                                                <p>{card.name}</p>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Button
                                type="primary"
                                onClick={handleNextStep}
                                style={{
                                    top: 20,
                                }}
                            >
                                Next Step
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Scan;
