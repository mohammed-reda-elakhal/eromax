import React from 'react';
import { Avatar } from 'antd';

function StatisBox({ icon, num, desc, theme, color }) {
    return (
        <div 
            className='statistic-colis-box'
            style={{
                backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: '8px',
                padding: '20px',
                margin: '8px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                width: '220px', // Légèrement plus large
                height: '130px', // Ajuster la hauteur
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                    icon={icon} 
                    size={32} // Taille de l'icône ajustée
                    style={{ color: color, marginRight: '8px',
                        backgroundColor: '#e0e0e0', // Couleur de fond par défaut ou personnalisée

                     }} // Espace entre l'icône et le nombre

                />
                <h5 style={{ fontSize: '1.5em', fontWeight: 'bold',lineHeight: '1.2', color,margin: 0 }}>{num}</h5>
            </div>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold',color: '#666' }}>{desc}</span>
        </div>
    );
}

export default StatisBox;
