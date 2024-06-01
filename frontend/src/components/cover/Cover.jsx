import React from 'react'
import './cover.css'
import { Link } from 'react-router-dom'
import { FaHandPointRight } from "react-icons/fa";
import {TruckFilled } from '@ant-design/icons'

function Cover() {
  return (
    <section className='cover'>
        <div className="cover-info">
            <p>Livraison Rapide   <TruckFilled className="cover-icon" /></p>
            <h1>Livraison Rapide et fiable pour votre boutique en ligne au Maroc</h1>
            <h4>Nous offrons des services de livraison pour les e-commerces avec paiement en espèces à la livraison.</h4>
            <Link to='' className='cover-link'>
                <FaHandPointRight className='cover-link-icon' />
                Devenir Client Rapide
            </Link>
        </div>
        <div className="cover-img">
            <img src="/image/gift.gif" alt="" />
        </div>
    </section>
  )
}

export default Cover