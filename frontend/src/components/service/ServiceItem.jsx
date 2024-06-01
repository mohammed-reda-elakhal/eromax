import React from 'react'

function ServiceItem({title , icon , desc}) {
  return (
    <div className='service-item'>
        <div className="service-item-icon">
            {icon}
        </div>
        <div className="service-item-info">
            <h2>
                {title}
            </h2>
            <p>
                {desc}
            </p>
        </div>
    </div>
  )
}

export default ServiceItem