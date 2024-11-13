import React, { useEffect } from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification, MdAttachMoney } from "react-icons/md";
import { SiStreamrunners } from "react-icons/si";
import { TbPlayerEjectFilled } from "react-icons/tb";
import { IoIosNotifications } from "react-icons/io";
import { GrInProgress } from "react-icons/gr";

import { FcProcess } from "react-icons/fc";

import { MdCancelScheduleSend } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { countColisAnnuleByRole, countColisByRole, countColisLivreByRole, countColisRetourByRole, countGainsByRole, getBigTransaction, getLastTransaction } from '../../../../redux/apiCalls/staticsApiCalls';

function StatsColis({ theme }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const store = useSelector(state => state.auth.store);
    const totalColisLivreByRole = useSelector((state) => state.statics.setColisLivreByRole);
    const totalColisAnnule = useSelector((state) => state.statics.setColisCancealByRole);
    const totalColisEncours = useSelector((state) => state.statics.setAllColis);
    const totalGains = useSelector((state) => state.statics.setTotalGains);
    const lastTransac = useSelector((state) => state.statics.setLastTransac);
    const BigTransac = useSelector((state) => state.statics.setBigTransac);
    const colisRetour = useSelector((state) => state.statics.setColisRetour);


    useEffect(() => {
        if (user && store && user.role) {
            const roleId = user.role === "client" ? store._id : user._id;
            dispatch(countColisAnnuleByRole(user.role, roleId));
            dispatch(countColisLivreByRole(user.role, roleId));
            dispatch(countColisByRole(user.role, roleId));
            dispatch(countGainsByRole(user.role, roleId));
            dispatch(getLastTransaction(store._id));
            dispatch(getBigTransaction(store._id));
            dispatch(countColisRetourByRole(user.role, roleId));



            
        }
    }, [dispatch, user, store]);

    const data = [
        { id: 1, icon: <MdDomainVerification />, num: totalColisLivreByRole || 0, desc: "Totale de Colis Livrée", color: '#4CAF50' },
        { id: 2, icon: <GrInProgress />, num: totalColisEncours || 0, desc: "Totale de Colis En cours", color: '#FFC72C' },
        { id: 3, icon: <MdCancelScheduleSend />, num: totalColisAnnule || 0, desc: "Colis Annulée", color: '#F44336' },
        {
            id: 4,
            icon: <MdDomainVerification />,
            num: colisRetour  || 0,
            desc: "Colis en Retour",
            color: '#FF9800'
        }
    ];

    const argent = [
        { id: 1, icon: <MdAttachMoney />, num: totalGains || 0, desc: "Total des gains", color: '#4CAF50' },
        { id: 2, icon: <IoMdNotificationsOutline />, num: lastTransac || 0, desc: "Dernière paiement est traité", color: '#2196F3' },
        {
            id: 3,
            icon: <MdAttachMoney />,
            num: BigTransac || 0,
            desc: "Plus grand Gains",
            color: '#FF7F50'
        }
    ];

    return (
        <div className="statistic-boxes">
            <div className="statistic-argent">
                {argent.map(item => (
                    <StatisBox key={item.id} icon={item.icon} num={item.num} desc={item.desc} theme={theme} color={item.color} />
                ))}
            </div>
            <div className='statistic-colis'>
                {data.map(item => (
                    <StatisBox key={item.id} icon={item.icon} num={item.num} desc={item.desc} theme={theme} color={item.color} />
                ))}
            </div>
        </div>
    );
}

export default StatsColis;
