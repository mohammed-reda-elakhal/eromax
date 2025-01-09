import React, { useEffect, useContext } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import { getStatisticColis } from '../../../../redux/apiCalls/staticsApiCalls';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function ColisCirclChart() {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const colisCount = useSelector((state) => state.statics.statisticColis);

  useEffect(() => {
    dispatch(getStatisticColis());
  }, [dispatch]);

  // Doughnut Chart Data
  const doughnutChartData = {
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
          ? ['#1ABC9C', '#F1C40F', '#E74C3C', '#9B59B6']
          : ['#4CAF50', '#FFC72C', '#FF6F61', '#6A5ACD'],
        borderColor: theme === 'dark'
          ? ['#16A085', '#F39C12', '#C0392B', '#8E44AD']
          : ['#4CAF50', '#FFC72C', '#FF6F61', '#6A5ACD'],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  // Doughnut Chart Options
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Bar Chart Data with different colors for each status
  const barChartData = {
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
        backgroundColor: [
          theme === 'dark' ? '#2ecc71' : '#4CAF50', // Livrée - Green
          theme === 'dark' ? '#f39c12' : '#FFC72C', // En cours - Yellow
          theme === 'dark' ? '#e74c3c' : '#FF6F61', // Echouée - Red
          theme === 'dark' ? '#9b59b6' : '#6A5ACD', // En retour - Purple
        ],
        borderColor: [
          theme === 'dark' ? '#27ae60' : '#388E3C',
          theme === 'dark' ? '#e67e22' : '#FFC72C',
          theme === 'dark' ? '#c0392b' : '#FF6F61',
          theme === 'dark' ? '#8e44ad' : '#6A5ACD',
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          theme === 'dark' ? '#27ae60' : '#388E3C',
          theme === 'dark' ? '#e67e22' : '#FFC72C',
          theme === 'dark' ? '#c0392b' : '#FF6F61',
          theme === 'dark' ? '#8e44ad' : '#6A5ACD',
        ],
      },
    ],
  };

  // Bar Chart Options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
      },
    },
  };

  return (
    <div
      className="chart-container"
      style={{
        width: '100%',
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
        borderRadius: '12px',
        boxShadow: theme === 'dark'
          ? '0px 4px 6px rgba(0, 0, 0, 0.5)'
          : '0px 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'row', // Arrange both charts side by side
        gap: '20px',
        justifyContent: 'space-between',
        transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      <h1>Statistic Colis</h1>
      <div
        className="chart-circl-colis"
        style={{
          width: '40%',
          height: '400px',
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#001529' : '#fff',
          borderRadius: '12px',
        }}
      >
        <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
      </div>
      <div
        className="chart-bar-colis"
        style={{
          width: '40%',
          height: '400px',
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#001529' : '#fff',
          borderRadius: '12px',
        }}
      >
        <Bar data={barChartData} options={barChartOptions} />
      </div>
    </div>
  );
}

export default ColisCirclChart;
