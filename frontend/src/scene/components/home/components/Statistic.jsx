import React from 'react'
import StatsTop from './StatsTop'
import { Divider } from 'antd'
import StatsColis from './StatsColis'
import StatsChart from './StatsChart'
import ColisData from '../../../../data/colis.json'

function Statistic({theme}) {
  return (
    <div className='statistic'>
        <Divider />
        <StatsColis theme={theme} />
        <Divider />
        <StatsChart theme={theme} data={ColisData} />
    </div>
  )
}

export default Statistic