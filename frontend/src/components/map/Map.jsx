import React from 'react'

function Map() {
  return (
    <div className='map' style={{textAlign:'center'}}>
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d79314.06499265101!2d-8.065872186482842!3d31.645077407922003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdaff1fe9d7c1fed%3A0xe7b1e782d047161a!2sHotel%20Riu%20Tikida%20Palmeraie!5e0!3m2!1sfr!2sma!4v1712465644510!5m2!1sfr!2sma" 
            width="95%" 
            height="450" 
            style={{border:'0'} }
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
    </div>
  )
}

export default Map