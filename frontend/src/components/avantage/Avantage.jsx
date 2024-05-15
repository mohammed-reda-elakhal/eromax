import React from 'react'
import AvantageItem from './AvantageItem';
import './avantage.css'
import { TbTruckDelivery } from "react-icons/tb";
import { MdOutlineTask } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { FaBoxesPacking } from "react-icons/fa6";
import { AiOutlineControl , AiOutlineFileProtect } from "react-icons/ai";

const avantages = [
    {
        id : 1,
        icon : <FaHome/>,
        title : 'Gestion multicanal',
        desc : 'Gérez des commandes à partir de tous les canaux sur lesquels vous vendez, y compris woocommerce et Shopify.'
    },{
        id : 2,
        icon : <FaBoxesPacking/>,
        title : 'Insertion',
        desc : "Qu'ils soient transactionnels ou postaux, les systèmes d'insertion hautes performances de Awalogs.ma offrent un traitement des documents sécurisé, efficace et flexible."
    },{
        id : 3,
        icon : <AiOutlineControl/>,
        title : 'Plus de contrôle',
        desc : "Vous pouvez rechercher vos colis dont vous avez manqué la livraison ou vérifier l'état de l’avancement de vos colis qui doivent être livrés."
    },{
        id : 4,
        icon : <AiOutlineFileProtect/>,
        title : 'La protection de la vie privée',
        desc : 'Toutes vos données ou les données de vos clients sont protégées à 100% et ne sont partagées avec aucun tiers'
    },{
        id : 5,
        icon : <MdOutlineTask/>,
        title : 'Précision et maîtrise',
        desc : 'Une équipe de professionnels assure la qualité du service.'
    },{
        id : 6,
        icon : <TbTruckDelivery/>,
        title : 'Rapidité de mise en œuvre',
        desc : "Tous nos services ont une priorité dans la mise en œuvre, et notre objectif principal est de vous servir et d'atteindre votre satisfaction."
    },
]
function Avantage() {
  return (
    <div className='avantage-section' id='avantage'>
        <div className="avantage-section-header">
            <h4>Pourquoi nous ?</h4>
            <h1>Les avantages de choisir Eromax.ma</h1>
        </div>
        <div className="avantage-section-main">
            {
                avantages.map(avantage=>(
                    <AvantageItem
                        key={avantage.id}
                        icon={avantage.icon}
                        title={avantage.title}
                        desc={avantage.desc}
                    />
                ))
            }
        </div>
    </div>
  )
}

export default Avantage