import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColisATRToday, getColisExpidée, getColisPret, getDemandeRetraitToday, getNouveauClient, getReclamationToday, getIncompleteWithdrawals } from '../../../../redux/apiCalls/missionApiCalls';
import { Card, Row, Col } from 'antd';
import { MailOutlined, DropboxOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FaParachuteBox, FaUser } from 'react-icons/fa';
import { TbTruckDelivery } from 'react-icons/tb';
import CountUp from 'react-countup';
import { FaMoneyBill1Wave } from 'react-icons/fa6';

function Mission({ theme }) {
    const { demandeRetrait, colis, openReclamationsCount, user, colisExp, colisPret, client, incompleteWithdrawals } = useSelector((state) => ({
        demandeRetrait: state.mission.demandeRetrait,
        colis: state.mission.colis,
        colisExp: state.mission.colisExp,
        colisPret: state.mission.colisPret,
        openReclamationsCount: state.mission.openReclamationsCount,
        client : state.mission.client,
        user: state.auth.user,
        incompleteWithdrawals: state.mission.incompleteWithdrawals,
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
            dispatch(getIncompleteWithdrawals());
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
            title: 'Réclamations Ouvertes',
            count: openReclamationsCount,
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
        {
            title: 'Demandes Retrait En Cours',
            count: incompleteWithdrawals,
            icon: <FaMoneyBill1Wave style={{ fontSize: '20px', color: theme === 'dark' ? '#ff4d4f' : '#f5222d' }} />,
            link: '/dashboard/demande-retrait',
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

    const CardBox = ({ title, count, icon, color, onClick }) => (
        <div
            onClick={onClick}
            style={{
                backgroundColor: theme === 'dark' ? '#1a1f36' : '#ffffff',
                borderRadius: '20px',
                padding: '25px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1px solid ${color}22`,
                boxShadow: count > 0
                    ? `0 10px 25px ${color}40`
                    : `0 10px 20px ${color}15`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: '160px',
                transform: 'translateY(0)',
                animation: count > 0 ? 'pulse 2s infinite' : 'none',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: count > 0
                        ? `0 20px 35px ${color}50`
                        : `0 15px 30px ${color}25`,
                }
            }}
        >
            <style>
                {`
                    @keyframes pulse {
                        0% { box-shadow: 0 10px 25px ${color}40; }
                        50% { box-shadow: 0 15px 30px ${color}60; }
                        100% { box-shadow: 0 10px 25px ${color}40; }
                    }
                `}
            </style>
            {/* Header with enhanced hover effect */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                transition: 'transform 0.3s ease'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '15px',
                    backgroundColor: count > 0 ? `${color}25` : `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: color,
                    transition: 'transform 0.3s ease, background-color 0.3s ease',
                    transform: count > 0 ? 'scale(1.05)' : 'scale(1)'
                }}>
                    {icon}
                </div>
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: count > 0 ? `${color}20` : `${color}10`,
                    color: color,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                }}>
                    {count > 0 ? 'Active' : 'Mission'}
                </div>
            </div>

            {/* Count with enhanced visibility for non-zero values */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <h3 style={{
                    fontSize: count > 0 ? '2.7rem' : '2.5rem',
                    fontWeight: '700',
                    margin: '0',
                    color: count > 0 ? color : `${color}99`,
                    textShadow: count > 0
                        ? `0 0 20px ${color}40`
                        : theme === 'dark' ? `0 0 20px ${color}33` : 'none',
                    transition: 'all 0.3s ease'
                }}>
                    <CountUp end={count || 0} duration={2} separator="," />
                </h3>
                <p style={{
                    margin: '10px 0 0',
                    fontSize: '1rem',
                    color: count > 0
                        ? (theme === 'dark' ? '#ffffffcc' : '#000000cc')
                        : (theme === 'dark' ? '#ffffff99' : '#00000099'),
                    fontWeight: count > 0 ? '600' : '500',
                    transition: 'all 0.3s ease'
                }}>
                    {title}
                </p>
            </div>

            {/* Enhanced background decoration */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${color}${count > 0 ? '20' : '10'} 0%, transparent 70%)`,
                borderRadius: '50%',
                zIndex: 0,
                opacity: count > 0 ? 0.7 : 0.5,
                transition: 'all 0.3s ease',
                transform: count > 0 ? 'scale(1.1)' : 'scale(1)'
            }}/>
        </div>
    );

    return (
        <div style={{
            padding: '30px',
            backgroundColor: theme === 'dark' ? '#002242' : '#fff',
            borderRadius: '20px',
            boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.37)'
                : '0 8px 32px rgba(31, 38, 135, 0.15)',
        }}>
            <h2 style={{
                marginBottom: '25px',
                color: theme === 'dark' ? '#fff' : '#333',
                fontSize: '1.5rem',
                fontWeight: '600'
            }}>
                Missions du Jour
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
            }}>
                {(user?.role === 'admin' ? adminCardsData : livreurCardsData).map((card, index) => (
                    <CardBox
                        key={index}
                        title={card.title}
                        count={card.count}
                        icon={card.icon}
                        color={theme === 'dark' ? '#69c0ff' : '#1890ff'}
                        onClick={() => navigate(card.link)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Mission;
