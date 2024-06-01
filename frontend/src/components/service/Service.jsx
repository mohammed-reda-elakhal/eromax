import React from 'react'
import './service.css'
import { FaBoxes } from "react-icons/fa";
import { GrDeliver } from "react-icons/gr";
import { AiOutlineFieldTime } from "react-icons/ai";
import { FaHandHoldingUsd } from "react-icons/fa";
import ServiceItem from './ServiceItem';
import HeaderSection from '../header/HeaderSection';


const services = [
    {
        id : 1,
        icon : <FaBoxes/>,
        title : 'Ramassage',
        desc : 'Le ramassage est un service mis en place par la Plateforme Awalogs.ma afin de faciliter au maximum votre processus d’expédition.'
    },
    {
        id : 2,
        icon : <GrDeliver/>,
        title : 'Livraison',
        desc : 'Grâce à une connaissance du terrain, nos livreurs récupèrent les colis pour une livraison en mains propres à vos clients dans plusieurs villes.'
    },
    {
        id : 1,
        icon : <AiOutlineFieldTime/>,
        title : 'Expédition',
        desc : 'L’équipe de Eromax.ma assure l’acheminement de vos colis à votre destinataire contre un accusé de réception.'
    },
    {
        id : 1,
        icon : <FaHandHoldingUsd/>,
        title : 'Fonds et paiements',
        desc : 'Nous assure le retour de fonds dans 48 H, des Virements, des bons de livraison d’une manière régulière sur les services de messagerie de nos clients.'
    },
]

function Service() {
  return (
    <section className='service'>
         <HeaderSection
            nom={`service`}
            title={`Que Pouvons-Nous Faire Pour Vous`}
            desc={`Vous vous concentrez sur la croissance. Nous assurons la logistique du commerce électronique.`}
         />
         <div className="service-main">
            {
                services.map(service =>(
                    <ServiceItem
                        key={service.id}
                        icon={service.icon}
                        title={service.title}
                        desc = {service.desc}
                    />
                ))
            }
         </div>
    </section>
  )
}

export default Service