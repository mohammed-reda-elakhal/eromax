import React from 'react'
import { GrDeliver } from "react-icons/gr";

function AvantageItem({icon , title , desc}) {
  return (
    <div className='avantage-item'>
        <div className="avantage-item-icon">
            {icon}
        </div>
        <h1 className="avantage-item-title">
            {title}
        </h1>
        <p className="avantage-item-desc">
            {desc}
        </p>
    </div>
  )
}

export default AvantageItem