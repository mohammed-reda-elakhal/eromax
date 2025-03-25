// TopCitiesChart.jsx
import React, { useEffect, useContext, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatisticVille } from '../../../../redux/apiCalls/staticsApiCalls';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../../ThemeContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Helper function to calculate dynamic step size
const calculateStepSize = (max, desiredSteps = 5) => {
    if (max === 0) return 1; // Avoid division by zero

    const rawStep = max / desiredSteps;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const residual = rawStep / magnitude;
    let step;

    if (residual > 5) {
        step = 10 * magnitude;
    } else if (residual > 2) {
        step = 5 * magnitude;
    } else if (residual > 1) {
        step = 2 * magnitude;
    } else {
        step = magnitude;
    }

    return step;
};

function TopCitiesChart() {
    const dispatch = useDispatch();
    const { theme } = useContext(ThemeContext); // Access the theme
    const villes = useSelector((state) => state.statics.villeStatistic);

    useEffect(() => {
        dispatch(getStatisticVille());
    }, [dispatch]);

    // Calculate dynamic step size using useMemo to optimize performance
    const yStepSize = useMemo(() => {
        if (!villes || villes.length === 0) return 1;

        const maxValue = Math.max(...villes.map((ville) => ville.count));
        const desiredSteps = 5; // You can adjust the desired number of steps here
        return calculateStepSize(maxValue, desiredSteps);
    }, [villes]);

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
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                titleColor: theme === 'dark' ? '#fff' : '#333',
                bodyColor: theme === 'dark' ? '#fff' : '#333',
                borderColor: theme === 'dark' ? '#1d4f91' : '#4CAF50',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.raw} colis`,
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
                grid: {
                    display: false
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Nombre de Colis',
                    color: theme === 'dark' ? '#fff' : '#666',
                },
                ticks: {
                    color: theme === 'dark' ? '#fff' : '#666',
                    stepSize: yStepSize, // Set the dynamic step size here
                    beginAtZero: true, // Ensure the y-axis starts at zero
                },
                grid: {
                    color: theme === 'dark' ? '#1d4f91' : '#e0e0e0',
                    drawBorder: false
                }
            }
        },
        onHover: (event, chartElement) => {
            event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
    };

    return (
        <div className="chart-container">
            <h2>Top 10 Villes</h2>
            <div className="chart-wrapper" style={{ height: '50vh', minHeight: '300px' }}>
                {villes.length > 0 ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <p>Chargement des données...</p>
                )}
            </div>
        </div>
    );
}

export default TopCitiesChart;
