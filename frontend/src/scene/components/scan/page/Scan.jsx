import React, { useContext, useState } from 'react';
import '../scan.css';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Card } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';

const { Meta } = Card;

function Scan() {
    const { theme } = useContext(ThemeContext);
    const { user } = useSelector(state => state.auth);

    // Dynamic data for card content
    const cardData = [
        {
            key: '1',
            title: "Ramassage",
            description: "Cette option pour ramasser une liste colis !!",
            imageUrl: "/image/r-colis.png",
            option1: { label: <CiBarcode />, link: "/dashboard/scan/ramasser" },
            option2: { label: <MdOutlineQrCodeScanner />, link: "/option2" }
        },
        {
            key: '2',
            title: "Livraison",
            description: "Cette option pour livrer une liste colis !!",
            imageUrl: "/image/l-colis.png",
            option1: { label: <CiBarcode />, link: "/option1" },
            option2: { label: <MdOutlineQrCodeScanner />, link: "/option2" }
        },
        {
            key: '3',
            title: "Annulée",
            description: "Cette option pour annuler une liste colis !!",
            imageUrl: "/image/a-colis.png",
            option1: { label: <CiBarcode />, link: "/option1" },
            option2: { label: <MdOutlineQrCodeScanner />, link: "/option2" }
        },
        {
            key: '4',
            title: "Rechercher",
            description: "Cette option pour rechercher une colis avec scan !!",
            imageUrl: "/image/s-colis.png",
            option1: { label: <CiBarcode />, link: "/dashboard/scan/recherche" },
            option2: { label: <MdOutlineQrCodeScanner />, link: "/option2" }
        }
    ];

    // Filter cards based on the user's role
    const filteredCardData = cardData.filter((card) => {
        if (user.role === 'admin' && card.title !== "Livraison") {
            return true;
        }
        if (user.role === 'livreur' && card.title !== "Ramassage") {
            return true;
        }
        if (user.role !== 'admin' && user.role !== 'livreur') {
            return true; // Allow all cards if role is neither admin nor livreur
        }
        return false;
    });

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
                        
                        {/* Responsive Card Grid */}
                        <Row gutter={[16, 16]}>
                            {filteredCardData.map((card) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={card.key}>
                                    <Card
                                        cover={
                                            <img
                                                alt={card.title}
                                                src={card.imageUrl}
                                                style={{ height: '100px', width: '100px', margin: '16px auto' }}
                                            />
                                        }
                                        actions={[
                                            <Link to={card.option1.link} key="option1">{card.option1.label}</Link>,
                                            <Link to={card.option2.link} key="option2">{card.option2.label}</Link>
                                        ]}
                                    >
                                        <Meta
                                            title={card.title}
                                            description={card.description}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Scan;
