import React, { useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../../ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
}

function BarChart({ data }: BarChartProps) {
  const { theme } = useContext(ThemeContext);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#fff' : '#666',
        }
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
      x: {
        grid: {
          display: false,
          color: theme === 'dark' ? '#1d4f91' : '#e0e0e0',
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#666',
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#1d4f91' : '#e0e0e0',
          drawBorder: false,
        },
        ticks: {
          color: theme === 'dark' ? '#fff' : '#666',
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      const target = event.native?.target as HTMLElement;
      if (target) {
        target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    }
  };

  return (
    <div className="chart-wrapper" style={{ height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default BarChart;