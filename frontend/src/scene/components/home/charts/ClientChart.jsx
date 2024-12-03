// ClientChart.jsx
import React, { useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStatisticClient } from '../../../../redux/apiCalls/staticsApiCalls';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../../ThemeContext';
import { Avatar } from 'antd';

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

function ClientChart() {
    const dispatch = useDispatch();
    const { theme } = useContext(ThemeContext);
    const topClients = useSelector((state) => state.statics.topClient);

    useEffect(() => {
        dispatch(getStatisticClient());
    }, [dispatch]);

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
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} colis`,
                    title: (context) => {
                        const storeIndex = context[0].dataIndex;
                        const store = topClients[storeIndex];
                        return `${store.storeName}`;
                    },
                },
            },
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
            },
            y: {
                title: {
                    display: true,
                    text: 'Nombre de Colis',
                    color: theme === 'dark' ? '#fff' : '#666',
                },
                ticks: {
                    color: theme === 'dark' ? '#fff' : '#666',
                    stepSize: 1,
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
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Top 10 Stores</h2>
            {topClients.length > 0 ? (
                <Bar data={chartData} options={options} plugins={[avatarPlugin]} />
            ) : (
                <p style={{ textAlign: 'center' }}>Chargement des données...</p>
            )}
        </div>
    );
}

export default ClientChart;
