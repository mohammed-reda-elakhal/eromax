import React from 'react'

function HeaderSection({nom , title , desc}) {
  return (
    <div className='header-section'>
        <span className='nom'>{nom}</span>
        <span className='title'>
            {title}
        </span>
        <span className='desc'>
            {desc}
        </span>
    </div>
  )
}

export default HeaderSection