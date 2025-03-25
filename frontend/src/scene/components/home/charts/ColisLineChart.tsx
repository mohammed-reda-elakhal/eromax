import React, { useState, useEffect, useContext } from 'react';
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
import { ThemeContext } from '../../../ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import {
  countColisLivreByRole,
  countColisRetourByRole
} from '../../../../redux/apiCalls/staticsApiCalls';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ColisLineChart() {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const user = useSelector((state: any) => state.auth.user);
  const store = useSelector((state: any) => state.auth.store);
  const colisLivrees = useSelector((state: any) => state.statics.setColisLivreByRole);
  const colisRetournees = useSelector((state: any) => state.statics.setColisRetour);

  useEffect(() => {
    if (user && store && user.role) {
      const roleId = user.role === "client" ? store._id : user._id;
      dispatch(countColisRetourByRole(user.role, roleId));
      dispatch(countColisLivreByRole(user.role, roleId));
    }
  }, [dispatch, user, store]);

  const chartData = {
    labels: getLast30DaysLabels(),
    datasets: [
      {
        label: 'Colis Livrées',
        data: Array(30).fill(colisLivrees),
        borderColor: theme === 'dark' ? '#69c0ff' : '#4CAF50',
        backgroundColor: theme === 'dark' ? '#69c0ff30' : '#4CAF5030',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Colis Retournées',
        data: Array(30).fill(colisRetournees),
        borderColor: theme === 'dark' ? '#ff7875' : '#f44336',
        backgroundColor: theme === 'dark' ? '#ff787530' : '#f4433630',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#fff' : '#666',
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#fff' : '#333',
        borderColor: theme === 'dark' ? '#1d4f91' : '#4CAF50',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? '#1d4f91' : '#e0e0e0',
          drawBorder: false,
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#666',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#666',
        },
      },
    },
    onHover: (event: any, elements: any[]) => {
      const target = event.native?.target as HTMLElement;
      if (target) {
        target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Helper function to get last 30 days labels
function getLast30DaysLabels(): string[] {
  const labels = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toISOString().split('T')[0]);
  }
  return labels;
}

export default ColisLineChart;
