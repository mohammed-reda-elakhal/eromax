import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['Livrée', 'En cours', 'Echouée'],
  datasets: [
    {
      label: '# of Votes',
      data: [106 , 36 , 90],
      backgroundColor: [
        'green',
        'yellow',
        'red',
      ],
      borderColor: [
        'green',
        'yellow',
        'red',
      ],
      borderWidth: 1,
    },
  ],
};

function BarChart() {
  return (
    <div style={{width:'30%'}}>
      <Doughnut data={data} />
    </div>
  )
}

export default BarChart