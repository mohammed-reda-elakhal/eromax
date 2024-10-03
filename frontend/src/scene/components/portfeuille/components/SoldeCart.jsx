import React from 'react'
import { useDispatch , useSelector } from 'react-redux';

function SoldeCart({theme}) {
    const {user , store} = useSelector(state => state.auth)
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
                {store.solde} DH
            </h2>
            <p>Solde du Compte</p>
        </div>
    </div>
  )
}

export default SoldeCart