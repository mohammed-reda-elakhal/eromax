import React, { useEffect } from 'react';
import StatisBox from './StatisBox';
import { MdDomainVerification } from "react-icons/md";
import { SiStreamrunners } from "react-icons/si";
import { TbPlayerEjectFilled } from "react-icons/tb";
import { MdAttachMoney } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { countColisAnnuleByRole, countColisLivre } from '../../../../redux/apiCalls/staticsApiCalls';


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
    const dispatch = useDispatch();
    const {setAllColis, setAllColisLivre, setColisLivreByRole,setColisCancealByRole} = useSelector((state) => state.statics);
    useEffect(() => {
        const fetchData = async () => {
          try {    
            // Fetch each statistic
            const deliveredData = await countColisLivre();
            dispatch(setAllColisLivre(deliveredData.count));
    
            const canceledData = await countColisAnnuleByRole("role", "id"); // Replace with the actual role and ID
            dispatch(setColisCancealByRole(canceledData.count));
    
    
    
          } catch (err) {
            //dispatch(setError(err.message || "Failed to load statistics"));
            //dispatch(setLoading(false));
          }
        };
    
        fetchData();
      }, [dispatch]);
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
