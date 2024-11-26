import React, { useEffect } from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification, MdAttachMoney } from "react-icons/md";
import { GrInProgress } from "react-icons/gr";
import { MdCancelScheduleSend } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { getStatisticArgent, getStatisticColis } from '../../../../redux/apiCalls/staticsApiCalls';

function StatsColis({ theme }) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const store = useSelector((state) => state.auth.store);
    const colisCount = useSelector((state) => state.statics.statisticColis);
    const argentCount = useSelector((state) => state.statics.argentStatistic);

    useEffect(() => {
        dispatch(getStatisticColis());
        if (user?.role === "client") {
            dispatch(getStatisticArgent());
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
            num: argentCount.totalDebit || 0,
            desc: "Total des gains",
            color: '#4CAF50',
        },
        {
            id: 2,
            icon: <MdAttachMoney />,
            num: argentCount.lastTransaction || 0,
            desc: "Dernière paiement est traité",
            color: '#2196F3',
        },
        {
            id: 3,
            icon: <MdAttachMoney />,
            num: argentCount.largestDebitTransaction || 0,
            desc: "Plus grand Gains",
            color: '#FF7F50',
        },
    ];

    return (
        <div
            className="statistic-boxes"
            style={{
                backgroundColor: theme === 'dark' ? '#002242' : '#fff',
                color: theme === 'dark' ? '#fff' : '#333',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: theme === 'dark'
                    ? '0px 4px 6px rgba(0, 0, 0, 0.5)'
                    : '0px 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
        >
            {user?.role === "client" && (
                <div className="statistic-argent">
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
            <div className="statistic-colis">
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
