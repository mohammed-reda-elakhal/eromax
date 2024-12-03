import React from 'react'
import StatsTop from './StatsTop'
import { Divider } from 'antd'
import StatsColis from './StatsColis'
import StatsChart from './StatsChart'
import ColisData from '../../../../data/colis.json'
import TopCitiesChart from './TopCities'
import ClientChart from '../charts/ClientChart'


function Statistic({theme}) {
  return (
    <div className='statistic'>
        <Divider />
        <StatsColis theme={theme} />
        <Divider />
        <img className='rotate_phone_dashboard' src="/image/rotate_phone.gif" alt="" />
        <StatsChart theme={theme} data={ColisData} />
        <Divider/>
        <TopCitiesChart />
        <Divider />
        <ClientChart />
    </div>
  )
}

export default Statistic