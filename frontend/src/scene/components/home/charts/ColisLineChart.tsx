import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Line Chart - Multi Axis',
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
    }
  },
};

const generateRandomData = (numPoints) => {
  return Array.from({ length: numPoints }, () => Math.floor(Math.random() * 100));
};

const getLast30DaysLabels = () => {
  const labels = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toISOString().split('T')[0]);
  }
  return labels;
};

function ColisLineChart({data}) {
  const [chartData, setChartData] = useState({
    labels: getLast30DaysLabels(),
    datasets: [
      {
        label: 'Colis Livrées',
        data: generateRandomData(30),
        borderColor: 'green',
        backgroundColor: 'green',
        yAxisID: 'y',
      },
      {
        label: 'Colis Retournées',
        data: generateRandomData(30),
        borderColor: 'red',
        backgroundColor: 'red',
        yAxisID: 'y',
      },
    ],
  });

  


  return (
    <div className='chart-line-colis'>
      <Line options={options} data={chartData} />
    </div>
  );
}

export default ColisLineChart;
