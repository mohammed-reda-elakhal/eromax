import React from 'react'

function AvantageItem({icon , title , desc}) {
  return (
    <div className='avantage-item'>
        <div className="avantage-item-icon">
            {icon}
        </div>
        <div className="avantage-item-info">
            <h2>{title}</h2>
            <p>{desc}</p>
        </div>
    </div>
  )
}

export default AvantageItem