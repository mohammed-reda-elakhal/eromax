import React from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification } from "react-icons/md";
import { SiStreamrunners } from "react-icons/si";
import { TbPlayerEjectFilled } from "react-icons/tb";

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

function StatsTop({theme}) {
  return (
    <div className='statistic-top'>
        
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

export default StatsTop;
