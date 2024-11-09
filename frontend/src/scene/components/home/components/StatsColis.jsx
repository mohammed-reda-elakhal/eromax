// statics colis 

import React, { useEffect } from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification } from "react-icons/md";
import { SiStreamrunners } from "react-icons/si";
import { TbPlayerEjectFilled } from "react-icons/tb";
import { MdAttachMoney } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { countColis, countColisAnnuleByRole, countColisByRole, countColisLivre, countColisLivreByRole, countGainsByRole } from '../../../../redux/apiCalls/staticsApiCalls';



const argent = [
    {
        id: 1,
        icon: <MdAttachMoney />,
        num: '180250' + ' DH',
        desc: "Total des gains"
    },
    {
        id: 2,
        icon: <IoIosNotifications />,
        num: '36200' + ' DH',
        desc: "Dernière paiement est traité"
    }
];

function StatsColis({theme}) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const store = useSelector(state => state.auth.store);
    const totalColisLivre = useSelector((state) => state.statics.setAllColisLivre);
    const totalColisLivreByRole = useSelector((state) => state.statics.setColisLivreByRole);
    const totalColisAnnule = useSelector((state) => state.statics.setColisCancealByRole);
    const totalColisEncours = useSelector((state)=>state.statics.setAllColis);
    const totalGains = useSelector((state)=>state.statics.setTotalGains);

    useEffect(() => {
        if (user && store && user.role) {
            if (user.role === "client") {
                dispatch(countColisAnnuleByRole(user.role, store._id));
                dispatch(countColisLivreByRole(user.role, store._id));
                dispatch(countColisByRole(user.role, store._id));
                dispatch(countGainsByRole(user.role, store._id));



            } else if (user.role === "livreur" || user.role === "team" ||user.role === "admin" ) {
                dispatch(countColisAnnuleByRole(user.role, user._id));
                dispatch(countColisLivreByRole(user.role, user._id));
                dispatch(countColisByRole(user.role,user._id));
                dispatch(countGainsByRole(user.role, user._id));


            }
        }
    }, [dispatch, user, store]);

    useEffect(() => {
        dispatch(countColisLivre());
       
      }, [dispatch]);
      useEffect(() => {
        // Log the updated value after it's set in Redux
        console.log('Updated colis livre:', totalColisLivre);
        console.log('colis livre role:', totalColisLivreByRole);
        console.log('colis annulé',totalColisAnnule);
        console.log('colis annulé',totalGains);


        
    }, [totalColisLivre,totalColisLivreByRole,totalColisAnnule]);
    const data = [
        {
            id: 1,
            icon: <MdDomainVerification />,
            num: totalColisLivreByRole || 0 ,  // Use totalColisLivre.count if it exists, otherwise show 'Chargement...'
            desc: "Totale de Colis Livrée"
        },
        {
            id: 2,
            icon: <SiStreamrunners />,
            num: totalColisEncours || 0 ,  // Use totalColisLivre.count if it exists, otherwise show 'Chargement...'
            desc: "Totale de Colis En cours "
        }
        ,
        {
            id: 3,
            icon: <TbPlayerEjectFilled />,
            num: totalColisAnnule ||0 , // Use totalColisLivre.count if it exists, otherwise show 'Chargement...'
            desc: "Colis Annullée"
        }
    ];
    const argent = [
        {
            id: 1,
            icon: <MdAttachMoney />,
            num: totalGains || 0 ,  // Use totalColisLivre.count if it exists, otherwise show 'Chargement...'
            desc: "Total des gains"
        },
        {
            id: 2,
            icon: <IoIosNotifications />,
            num: '36200' + ' DH',
            desc: "Dernière paiement est traité"
        }
    ];
  return (
    <div className="statistic-boxes">
        <div className="statistic-argent">
            {argent.map((item, index) => (
                <StatisBox
                    key={item.id}
                    icon={item.icon}
                    num={item.num}
                    desc={item.desc}
                    theme={theme}
                    color={'green'}
                />
            ))}
        </div>
        
        <div className='statistic-colis'>
            {data.map((item, index) => (
                <StatisBox
                    key={item.id}
                    icon={item.icon}
                    num={item.num}
                    desc={item.desc}
                    theme={theme}
                    color={getColorByIndex(index)}
                />
            ))}
        </div>
    </div>

  );
}

function getColorByIndex(index,dataLength) {
    if (index === 0) {
        return 'green'; // First icon, color green
    } else if (index === dataLength - 1) {
        return 'red'; // Last icon, color red
    } else {
        return 'yellow'; // Middle icons, color yellow
    }
}

export default StatsColis;
