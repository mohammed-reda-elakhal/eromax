import React from 'react';
import './about.css'
import { Button } from 'antd';


function About() {
    // Full description from API
    const about_text = `eromax.ma est la nouvelle solution pour gérer vos livraisons en ligne, elle consiste à piloter les flux physiques de produit à destination finale en garantissant une meilleure qualité de service dans les délais les plus compétitifs.
    Notre Plateforme assure l’expédition, le ramassage, l’arrivage, la livraison, le retour des fonds, la confirmation, le stock et la gestion documentaire. On propose ainsi à chaque client professionnel soit-il ou particulier une prestation complète, variée et optimale grâce à une expérience riche aussi que professionnelle sur le marché de la messagerie nationale`;

    // Split the text into paragraphs based on the newline character (\n)
    const paragraphs = about_text.split('\n');

    return (
        <div className='about-section' id='about'>
            <div className="about-section-content">
                <h2>QUI SOMMES-NOUS ?</h2>
                <h1>Eromax.ma</h1>
                {/* Map over the paragraphs and wrap each one in a <p> tag */}
                {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                <Button type="primary" size='large'>
                    plus d'info
                </Button>
            </div>
            <img src="/image/about.jpg" alt="" />
        </div>
    );
}

export default About;
