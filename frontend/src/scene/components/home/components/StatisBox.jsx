import React from 'react';
import { Avatar } from 'antd';
import CountUp from 'react-countup';

function StatisBox({ icon, num, desc, theme, color }) {
    return (
        <div 
            className="statistic-colis-box"
            style={{
                backgroundColor: theme === 'dark' ? '#1a1f36' : '#ffffff',
                color: theme === 'dark' ? '#fff' : '#333',
                borderRadius: '20px',
                padding: '25px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: `1px solid ${color}22`,
                boxShadow: `0 10px 20px ${color}15`,
                transform: 'translateY(0)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: '180px',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 30px ${color}25`
                }
            }}
        >
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '15px',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: color
                }}>
                    {icon}
                </div>
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: `${color}10`,
                    color: color,
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {typeof icon === 'string' ? icon : 'Stats'}
                </div>
            </div>

            {/* Number */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <h3 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '700',
                    margin: '0',
                    color: color,
                    textShadow: theme === 'dark' ? `0 0 20px ${color}33` : 'none'
                }}>
                    <CountUp 
                        end={Number(num) || 0}
                        duration={2}
                        separator=","
                    />
                </h3>
            </div>

            {/* Description */}
            <div style={{
                borderTop: `1px solid ${color}15`,
                paddingTop: '15px',
            }}>
                <p style={{ 
                    margin: '0',
                    fontSize: '0.95rem',
                    color: theme === 'dark' ? '#ffffff99' : '#00000099',
                    fontWeight: '500',
                    letterSpacing: '0.3px'
                }}>
                    {desc}
                </p>
            </div>

            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
                borderRadius: '50%',
                zIndex: 0,
                opacity: 0.5
            }}/>
        </div>
    );
}

export default StatisBox;
