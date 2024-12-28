import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColisATRToday, getColisExpidée, getColisPret, getDemandeRetraitToday, getNouveauClient, getReclamationToday } from '../../../../redux/apiCalls/missionApiCalls';
import { Card, Row, Col } from 'antd';
import { MailOutlined, DropboxOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FaParachuteBox, FaUser } from 'react-icons/fa';
import { TbTruckDelivery } from 'react-icons/tb';

function Mission({ theme }) {
    const { demandeRetrait, colis, reclamations, user , colisExp , colisPret , client } = useSelector((state) => ({
        demandeRetrait: state.mission.demandeRetrait,
        colis: state.mission.colis,
        colisExp: state.mission.colisExp,
        colisPret: state.mission.colisPret,
        reclamations: state.mission.reclamations,
        client : state.mission.client,
        user: state.auth.user,
    }));

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Function to dispatch actions based on the user role
    const getData = () => {
        if(user?.role === "admin"){
            dispatch(getDemandeRetraitToday());
            dispatch(getReclamationToday());
            dispatch(getColisATRToday());
            dispatch(getNouveauClient(15))
        }else if(user?.role === "livreur"){
            dispatch(getColisExpidée())
            dispatch(getColisPret())
        } 
    };

    useEffect(() => {
        if (user?.role) {
            getData();
        }
    }, [user, dispatch]);

    // Cards data for different roles
    const adminCardsData = [
        {
            title: 'Colis',
            count: colis.length,
            icon: <DropboxOutlined style={{ fontSize: '20px', color: theme === 'dark' ? '#69c0ff' : '#1890ff' }} />,
            link: '/dashboard/colis-ar',
        },
        {
            title: 'Reclamations',
            count: reclamations.length,
            icon: <SolutionOutlined style={{ fontSize: '20px', color: theme === 'dark' ? '#ffc069' : '#faad14' }} />,
            link: '/dashboard/reclamation',
        },
        /*
        {
            title: 'Demandes Retrait',
            count: demandeRetrait.length,
            icon: <MailOutlined style={{ fontSize: '20px', color: theme === 'dark' ? '#95de64' : '#52c41a' }} />,
            link: '/dashboard/demande-retrait',
        },
        */
        {
            title: 'Nouveau Client',
            count: client.length,
            icon: <FaUser style={{ fontSize: '20px', color: theme === 'dark' ? '#95de64' : '#52c41a' }} />,
            link: '/dashboard/compte/client',
        },
    ];

    const livreurCardsData = [
        {
            title: 'Colis Expidée',
            count: colisExp,
            icon: <FaParachuteBox style={{ fontSize: '20px', color: theme === 'dark' ? '#95de64' : '#52c41a' }} />,
            link: '/dashboard/colis-ex',
        },
        {
            title: 'Colis Pret de livrée',
            count: colisPret,
            icon: <TbTruckDelivery style={{ fontSize: '20px', color: theme === 'dark' ? '#95de64' : '#52c41a' }} />,
            link: '/dashboard/colis-md',
        },
    ];

    // Dynamically choose the cards data based on user role
    const cardsData = user?.role === 'admin' ? adminCardsData : livreurCardsData;

    return (
        <Card
            title="Missions du Jour"
            bordered={true}
            style={{
                maxWidth: '800px',
                margin: '20px auto',
                backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                color: theme === 'dark' ? '#fff' : '#333',
                boxShadow: theme === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
            }}
        >
            <Row gutter={[16, 16]}>
                {cardsData.map((card, index) => (
                    <Col xs={24} sm={12} key={index}>
                        <Card
                            hoverable
                            size="small"
                            className={card.count > 0 ? 'highlight-card' : ''}
                            style={{
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#333',
                                border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
                                boxShadow: theme === 'dark'
                                    ? '0 4px 8px rgba(0, 0, 0, 0.5)'
                                    : '0 4px 8px rgba(0, 0, 0, 0.1)',
                                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                            }}
                            bordered={true}
                            onClick={() => navigate(card.link)}
                        >
                            {card.icon}
                            <h3 style={{ margin: '10px 0 5px', color: theme === 'dark' ? '#fff' : '#333' }}>
                                {card.title}
                            </h3>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px', color: theme === 'dark' ? '#fff' : '#333' }}>
                                {card.count}
                            </p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );
}

export default Mission;
