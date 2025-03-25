import React, { useEffect, useState } from 'react'
import ColisCirclChart from '../charts/ColisCirclChart.tsx'
import ColisLineChart from '../charts/ColisLineChart.tsx'

function StatsChart({data}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className='statistic-chart' style={{ padding: '10px' }}>
        <ColisCirclChart data={data} />
      </div>
    );
  }

  return (
    <div className='statistic-chart'>
      <ColisCirclChart data={data} />
    </div>
  );
}

export default StatsChart;