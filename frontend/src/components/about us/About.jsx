import React from 'react'
import HeaderSection from '../header/HeaderSection'
import './about.css'
import { Link } from 'react-router-dom';
import { FaHandPointRight } from "react-icons/fa";

function About() {
     // Full description from API
     const about_text = `eromax.ma est la nouvelle solution pour gérer vos livraisons en ligne, elle consiste à piloter les flux physiques de produit à destination finale en garantissant une meilleure qualité de service dans les délais les plus compétitifs.
     Notre Plateforme assure l’expédition, le ramassage, l’arrivage, la livraison, le retour des fonds, la confirmation, le stock et la gestion documentaire. On propose ainsi à chaque client professionnel soit-il ou particulier une prestation complète, variée et optimale grâce à une expérience riche aussi que professionnelle sur le marché de la messagerie nationale`;
 
     // Split the text into paragraphs based on the newline character (\n)
     const paragraphs = about_text.split('\n');
  return (
    <section className='about'>
        <HeaderSection
            nom={`A Propos`}
            title={`Qui Sommes-Nous?`}
            desc={`Et Comment On Travail?`}
        />
        <div className="about-main">
            
            <div className="about-info">
                {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                <Link to='' className='cover-link'>
                    <FaHandPointRight className='cover-link-icon' />
                    Devenir Client Rapide
                </Link>
            </div>
            <div className="about-img">
                <img src="/image/about.png" alt="" />
            </div>
        </div>
    </section>
  )
}

export default About