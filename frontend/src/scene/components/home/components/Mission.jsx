import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColisATRToday, getDemandeRetraitToday, getReclamationToday } from '../../../../redux/apiCalls/missionApiCalls';
import { Card, Row, Col } from 'antd';
import { MailOutlined, DropboxOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function Mission({ theme }) {
    const { demandeRetrait, colis, reclamations, user } = useSelector((state) => ({
        demandeRetrait: state.mission.demandeRetrait,
        colis: state.mission.colis,
        reclamations: state.mission.reclamations,
        user: state.auth.user,
    }));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getData = () => {
        dispatch(getDemandeRetraitToday());
        dispatch(getReclamationToday());
        dispatch(getColisATRToday());
    };

    useEffect(() => {
        if (user?.role === "admin") {
            getData();
        }
    }, [user, dispatch]);

    const cardsData = [
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
        {
            title: 'Demandes Retrait',
            count: demandeRetrait.length,
            icon: <MailOutlined style={{ fontSize: '20px', color: theme === 'dark' ? '#95de64' : '#52c41a' }} />,
            link: '/dashboard/demande-retrait',
        },
    ];

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
