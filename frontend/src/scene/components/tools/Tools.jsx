import React, { useContext, useState } from 'react';
import './tools.css';
import { ThemeContext } from '../../ThemeContext';
import Menubar from '../../global/Menubar';
import Topbar from '../../global/Topbar';
import Title from '../../global/Title';
import { Row, Col, Card, message } from 'antd';
import { MdOutlineMonetizationOn, MdContentCopy } from 'react-icons/md';
import { useSelector } from 'react-redux';
import FixeCRBTModal from './modals/FixeCRBTModal';  
import CopieColisModal from './modals/CopieColisModal';

const Tools = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);

  const [isFixeCRBTModalVisible, setIsFixeCRBTModalVisible] = useState(false);
  const [isCopieColisModalVisible, setIsCopieColisModalVisible] = useState(false);

  const toolsItems = [
    {
      id: 1,
      name: 'Fixe CRBT',
      icon: <MdOutlineMonetizationOn style={{ fontSize: '40px', color: theme === 'dark' ? '#1f75cb' : '#1890ff' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#f0f5ff',
    },
    {
      id: 2,
      name: 'Copie Colis',
      icon: <MdContentCopy style={{ fontSize: '40px', color: theme === 'dark' ? '#3da53d' : '#52c41a' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#f6ffed',
    },
  ];

  const handleToolClick = (tool) => {
    if (tool.name === 'Fixe CRBT') {
      setIsFixeCRBTModalVisible(true);
    } else if (tool.name === 'Copie Colis') {
      setIsCopieColisModalVisible(true);
    } else {
      message.info(`Clicked on ${tool.name}`);
    }
  };

  const handleModalCancel = () => {
    setIsFixeCRBTModalVisible(false);
  };

  const handleFixCRBT = async (codeSuivi) => {
    console.log("Fixing CRBT for code:", codeSuivi);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="page-dashboard">
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
            color: theme === 'dark' ? '#fff' : '#002242',
            padding: '20px',
          }}
        >
          <div 
            className="content"
            style={{
                backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                padding: '20px',
            }}
          >
            <Title title="Tools" />
            <Row gutter={[24, 24]}>
              {toolsItems.map((tool) => (
                <Col key={tool.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    onClick={() => handleToolClick(tool)}
                    style={{
                      textAlign: 'center',
                      backgroundColor: tool.bgColor,
                      border: `1px solid ${theme === 'dark' ? '#303030' : '#e8e8e8'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{
                      padding: '24px',
                    }}
                  >
                    <div style={{
                      marginBottom: '16px',
                      transition: 'transform 0.3s ease',
                    }}>
                      {tool.icon}
                    </div>
                    <div style={{
                      marginTop: '8px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                    }}>
                      {tool.name}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </main>
      <FixeCRBTModal
        visible={isFixeCRBTModalVisible}
        onCancel={() => setIsFixeCRBTModalVisible(false)}
        onFix={handleFixCRBT}
      />
      <CopieColisModal
        visible={isCopieColisModalVisible}
        onCancel={() => setIsCopieColisModalVisible(false)}
      />
    </div>
  );
};

export default Tools;
