import React from 'react'
import TarifTable from './TarifTable'
import './tarif.css'

function Tarif() {
  return (
    <div className='tarif-section' id='tarif'>
        <div className="avantage-section-header">
            <h4>Tarif</h4>
            <h1>Les frais de livraison au Maroc</h1>
        </div>
        <div className="tarif-section-main">
            <TarifTable/>
        </div>
    </div>
  )
}

export default Tarif