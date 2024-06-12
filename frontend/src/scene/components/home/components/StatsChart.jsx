import React from 'react'
import BarChart from '../charts/BarChart.tsx'
import ColisCirclChart from '../charts/ColisCirclChart.tsx'
import ColisLineChart from '../charts/ColisLineChart.tsx'

function StatsChart({data}) {
  return (
    <div className='statistic-chart'>
        <ColisCirclChart data={data} />
        <ColisLineChart data = {data}/>
    </div>
  )
}

export default StatsChart