import React, { useEffect } from 'react'
import { useDispatch , useSelector } from 'react-redux';
import { getStoreById } from '../../../../redux/apiCalls/profileApiCalls';

function SoldeCart({theme}) {
    const dispatch = useDispatch()
    const {user , store} = useSelector(state => state.auth)
    const  storeData = useSelector(state => state.profile.store)
  
  
    useEffect(()=>{
        if(user?.role ==="client"){
            dispatch(getStoreById(store?._id))
        }
    },[dispatch])
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
                    {storeData?.solde} DH
                </h2>
                <p>Solde du Compte</p>
            </div>
        </div>
    )
}

export default SoldeCart