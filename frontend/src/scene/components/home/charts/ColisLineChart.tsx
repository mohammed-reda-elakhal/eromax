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
import {
  countColisAnnuleByRole,
  countColisLivreByRole,
  countColisRetourByRole
} from '../../../../redux/apiCalls/staticsApiCalls';
import { useDispatch, useSelector } from 'react-redux';

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
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const store = useSelector(state => state.auth.store);

  // Sélection des données du Redux store
  const colisLivrees = useSelector((state) => state.statics.setColisLivreByRole);
  const colisRetournees = useSelector((state) => state.statics.setColisRetour);

  useEffect(() => {
    if (user && store && user.role) {
      const roleId = user.role === "client" ? store._id : user._id;
            dispatch(countColisRetourByRole(user.role, roleId));
            dispatch(countColisLivreByRole(user.role, roleId));
      
            
    }
  }, [dispatch, user, store]);







  const [chartData, setChartData] = useState({
    labels: getLast30DaysLabels(),
    datasets: [
      {
        label: 'Colis Livrées',
        data: Array(30).fill(colisLivrees), // Utilisation des données Redux
        borderColor: 'green',
        backgroundColor: 'green',
        yAxisID: 'y',
      },
      {
        label: 'Colis Retournées',
        data: Array(30).fill(colisRetournees), // Utilisation des données Redux
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
