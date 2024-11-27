import React from 'react';
import { Avatar } from 'antd';

function StatisBox({ icon, num, desc, theme, color }) {
    return (
        <div 
            className="statistic-colis-box"
            style={{
                backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                color: theme === 'dark' ? '#fff' : '#333',
                borderLeft: `5px solid ${color}`,
                boxShadow: theme === 'dark'
                    ? '0px 4px 8px rgba(0, 0, 0, 0.5)'
                    : '0px 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                    icon={icon} 
                    size={32}
                    style={{
                        backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
                        color: color,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
                <h5 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
                    {num}
                </h5>
            </div>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold', marginTop: '8px' }}>
                {desc}
            </span>
        </div>
    );
}

export default StatisBox;
