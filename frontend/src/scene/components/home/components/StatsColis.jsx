import React, { useEffect } from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification, MdAttachMoney } from "react-icons/md";
import { GrInProgress } from "react-icons/gr";
import { MdCancelScheduleSend } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { getStatisticArgent, getTransferStatistics, getStatisticColis } from '../../../../redux/apiCalls/staticsApiCalls';

function StatsColis({ theme }) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const store = useSelector((state) => state.auth.store);
    const colisCount = useSelector((state) => state.statics.statisticColis);
    const argentCount = useSelector((state) => state.statics.argentStatistic);

    useEffect(() => {
        dispatch(getStatisticColis());
        if (user?.role === "client") {
            dispatch(getTransferStatistics());
        }
    }, [dispatch, user, store]);

    const data = [
        {
            id: 1,
            icon: <MdDomainVerification />,
            num: colisCount.colisLivree || 0,
            desc: "Totale de Colis Livrée",
            color: '#4CAF50',
        },
        {
            id: 2,
            icon: <GrInProgress />,
            num: colisCount.colisEnCours || 0,
            desc: "Totale de Colis En cours",
            color: '#FFC72C',
        },
        {
            id: 3,
            icon: <MdCancelScheduleSend />,
            num: colisCount.colisRefusee || 0,
            desc: "Colis Annulée",
            color: '#F44336',
        },
        {
            id: 4,
            icon: <MdDomainVerification />,
            num: colisCount.colisEnRetour || 0,
            desc: "Colis en Retour",
            color: '#FF9800',
        },
    ];

    const argent = [
        {
            id: 1,
            icon: <MdAttachMoney />,
            num: argentCount.totalTransfers || 0,
            desc: "Total des gains",
            color: '#4CAF50',
        },
        {
            id: 2,
            icon: <MdAttachMoney />,
            num: argentCount.lastTransferMontant || 0,
            desc: "Dernière paiement traité",
            color: '#2196F3',
        },
        {
            id: 3,
            icon: <MdAttachMoney />,
            num: argentCount.largestTransferMontant || 0,
            desc: "Plus grand paiement",
            color: '#FF7F50',
        },
    ];

    return (
        <div
            className="statistic-boxes"
            style={{
                backgroundColor: theme === 'dark' ? '#002242' : '#fff',
                color: theme === 'dark' ? '#fff' : '#333',
                padding: '30px', // Added padding for the parent container
                borderRadius: '12px',
                boxShadow: theme === 'dark'
                    ? '0px 4px 6px rgba(0, 0, 0, 0.5)'
                    : '0px 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
        >
            {user?.role === "client" && (
                <div 
                    className="statistic-argent"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', // Responsive grid layout
                        gap: '20px', // Added spacing between boxes
                        marginBottom: '30px', // Added spacing below the "argent" section
                    }}
                >
                    {argent.map((item) => (
                        <StatisBox
                            key={item.id}
                            icon={'DH'}
                            num={item.num}
                            desc={item.desc}
                            theme={theme}
                            color={item.color}
                        />
                    ))}
                </div>
            )}
            <div 
                className="statistic-colis"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', // Responsive grid layout
                    gap: '20px', // Added spacing between boxes
                }}
            >
                {data.map((item) => (
                    <StatisBox
                        key={item.id}
                        icon={item.icon}
                        num={item.num}
                        desc={item.desc}
                        theme={theme}
                        color={item.color}
                    />
                ))}
            </div>
        </div>
    );
}

export default StatsColis;
