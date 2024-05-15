import React from 'react'

function ServiceItem({icon , title , desc}) {
  return (
    <div className='service-item'>
        <div className='service-item-icon'> {icon} </div>
        <h2 className='service-item-title'>{title}</h2>
        <p className='service-item-desc'>
            {desc}
        </p>
    </div>
  )
}

export default ServiceItem