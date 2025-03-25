// ClientChart.jsx
import React, { useEffect, useContext, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatisticClient } from '../../../../redux/apiCalls/staticsApiCalls';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'; // Removed Image
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../../ThemeContext';
import { Image, Avatar } from 'antd'; // Import Image from 'antd'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Custom plugin to draw avatars on the X-axis labels
const avatarPlugin = {
    id: 'avatarPlugin',
    afterDraw: (chart) => {
        const { ctx, chartArea: { left, right, bottom }, scales: { x } } = chart;
        const labels = chart.data.labels;
        const images = chart.data.images || [];

        labels.forEach((label, index) => {
            const xPos = x.getPixelForValue(index);
            const yPos = bottom + 10;

            if (images[index]) {
                const img = new Image();
                img.src = images[index];
                img.onload = () => {
                    const imgWidth = 20;
                    const imgHeight = 20;
                    ctx.drawImage(img, xPos - imgWidth / 2, yPos, imgWidth, imgHeight);
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${images[index]}`);
                };
            }
        });
    }
};

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

function ClientChart() {
    const dispatch = useDispatch();
    const { theme } = useContext(ThemeContext);
    const topClients = useSelector((state) => state.statics.topClient);

    useEffect(() => {
        dispatch(getStatisticClient());
    }, [dispatch]);

    // Calculate dynamic step size using useMemo to optimize performance
    const yStepSize = useMemo(() => {
        if (!topClients || topClients.length === 0) return 1;

        const maxValue = Math.max(...topClients.map((client) => client.colisCount));
        const desiredSteps = 5; // You can adjust the desired number of steps here
        return calculateStepSize(maxValue, desiredSteps);
    }, [topClients]);

    const chartData = {
        labels: topClients.map((client) => client.storeName),
        images: topClients.map((client) => client.profileImage),
        datasets: [
            {
                label: 'Nombre de Colis Traités',
                data: topClients.map((client) => client.colisCount),
                backgroundColor: theme === 'dark' ? '#69c0ff' : '#4CAF50',
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
                    title: (context) => {
                        const storeIndex = context[0].dataIndex;
                        const store = topClients[storeIndex];
                        return `${store.storeName}`;
                    },
                },
            },
            avatarPlugin,
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Stores',
                    color: theme === 'dark' ? '#fff' : '#666',
                },
                ticks: {
                    color: theme === 'dark' ? '#fff' : '#666',
                    padding: 30,
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
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Top 10 Clients</h2>
            <div className="chart-wrapper" style={{ height: '50vh', minHeight: '300px' }}>
                {topClients.length > 0 ? (
                    <Bar data={chartData} options={options} plugins={[avatarPlugin]} />
                ) : (
                    <p style={{ textAlign: 'center' }}>Chargement des données...</p>
                )}
            </div>
        </div>
    );
}

export default ClientChart;
