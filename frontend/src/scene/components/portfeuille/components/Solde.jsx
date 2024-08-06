import React from 'react'
import SoldeCart from './SoldeCart'
import DemandeRetrait from './DemandeRetrait'

function Solde({theme}) {
  return (
    <div className='solde-section'>
        <SoldeCart theme={theme} />
        <DemandeRetrait theme={theme} />
    </div>
  )
}

export default Solde