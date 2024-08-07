import { Avatar } from 'antd'
import React from 'react'

function StatisBox({icon , num , desc , theme , color}) {
  return (
    <div 
        className='statistic-colis-box'
        style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
        }}
    >
        <Avatar 
            icon={icon} 
            size={50}
            style={{
                color:color
            }}
        />
        <div className="box-content">
            <h5>{num}</h5>
            <span>{desc}</span>
        </div>
    </div>
  )
}

export default StatisBox