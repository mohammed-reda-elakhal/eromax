import React, { useEffect, useContext } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import { getStatisticColis } from '../../../../redux/apiCalls/staticsApiCalls';

ChartJS.register(ArcElement, Tooltip, Legend);

function ColisCirclChart() {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const colisCount = useSelector((state) => state.statics.statisticColis);

  useEffect(() => {
    dispatch(getStatisticColis());
  }, [dispatch]);

  const chartData = {
    labels: ['Livrée', 'En cours', 'Echouée', 'En retour'],
    datasets: [
      {
        label: 'Statut des Colis',
        data: [
          colisCount.colisLivree || 0,
          colisCount.colisEnCours || 0,
          colisCount.colisRefusee || 0,
          colisCount.colisEnRetour || 0,
        ],
        backgroundColor: theme === 'dark'
          ? ['#1ABC9C', '#F1C40F', '#E74C3C', '#9B59B6'] // Dark mode colors
          : ['#4CAF50', '#FFC72C', '#FF6F61', '#6A5ACD'], // Light mode colors
        borderColor: theme === 'dark'
          ? ['#16A085', '#F39C12', '#C0392B', '#8E44AD']
          : ['#4CAF50', '#FFC72C', '#FF6F61', '#6A5ACD'],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Ensures the chart can resize properly
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
      },
    },
  };

  return (
    <div
      className="chart-circl-colis"
      style={{
        width: '100%',
        height: '400px', // Ensures responsiveness
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
        borderRadius: '12px',
        boxShadow: theme === 'dark'
          ? '0px 4px 6px rgba(0, 0, 0, 0.5)'
          : '0px 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
        Statut des Colis
      </h2>
      <div style={{ width: '100%', height: '100%' }}>
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default ColisCirclChart;
