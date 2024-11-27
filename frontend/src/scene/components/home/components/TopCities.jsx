import React, { useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatisticVille } from '../../../../redux/apiCalls/staticsApiCalls';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../../ThemeContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function TopCitiesChart() {
    const dispatch = useDispatch();
    const { theme } = useContext(ThemeContext); // Access the theme
    const villes = useSelector((state) => state.statics.villeStatistic);

    useEffect(() => {
        dispatch(getStatisticVille());
    }, [dispatch]);

    // Prepare data for the Bar Chart
    const chartData = {
        labels: villes.map((ville) => ville.ville), // X-axis: Ville names
        datasets: [
            {
                label: 'Nombre de Colis',
                data: villes.map((ville) => ville.count), // Y-axis: Colis count
                backgroundColor: theme === 'dark' ? '#69c0ff' : '#4CAF50', // Adjust bar color based on theme
                borderColor: theme === 'dark' ? '#1d4f91' : '#388E3C',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide legend for a cleaner look
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} colis`, // Custom tooltip format
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Villes',
                    color: theme === 'dark' ? '#fff' : '#666',
                },
                ticks: {
                    color: theme === 'dark' ? '#fff' : '#666',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Nombre de Colis',
                    color: theme === 'dark' ? '#fff' : '#666',
                },
                ticks: {
                    color: theme === 'dark' ? '#fff' : '#666',
                    stepSize: 5, // Adjust step size to 5
                },
            },
        },
    };

    return (
        <div
            className="chart-container"
            style={{
                width: '100%',
                margin: '20px auto',
                padding: '20px',
                backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                color: theme === 'dark' ? '#fff' : '#333',
                borderRadius: '12px',
                boxShadow: theme === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.7)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
            }}
        >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Top 10 Villes par Nombre de Colis</h2>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default TopCitiesChart;
