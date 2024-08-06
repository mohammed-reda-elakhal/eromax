import React from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification } from "react-icons/md";
import { SiStreamrunners } from "react-icons/si";
import { TbPlayerEjectFilled } from "react-icons/tb";
import { MdAttachMoney } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";

const data = [
    {
        id: 1,
        icon: <MdDomainVerification />,
        num: '31506',
        desc: "Totale de Colis Livrée"
    },
    {
        id: 2,
        icon: <SiStreamrunners />,
        num: '36',
        desc: "Totale de Colis En cours "
    }
    ,
    {
        id: 3,
        icon: <TbPlayerEjectFilled />,
        num: '90',
        desc: "Colis Annullée"
    }
];
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

function getColorByIndex(index) {
    if (index === 0) {
        return 'green'; // First icon, color green
    } else if (index === data.length - 1) {
        return 'red'; // Last icon, color red
    } else {
        return 'yellow'; // Middle icons, color yellow
    }
}

export default StatsColis;
