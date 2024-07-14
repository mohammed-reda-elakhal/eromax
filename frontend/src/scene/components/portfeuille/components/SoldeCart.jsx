import React from 'react'

function SoldeCart({theme}) {
  return (
    <div className='carte-solde'>
        <div className="logo">
            <img
                src={theme === 'dark' ? '/image/logo.png' : '/image/logo-light.png'}
                alt=""
            />
        </div>
        <h3>Mohammed reda</h3>
        <div className="solde">
            <h2 className="solde-value">
                0.00 DH
            </h2>
            <p>Solde du Compte</p>
        </div>
    </div>
  )
}

export default SoldeCart