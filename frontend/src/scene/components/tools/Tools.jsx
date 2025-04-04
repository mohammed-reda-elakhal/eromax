import React, { useContext, useState } from 'react';
import './tools.css';
import { ThemeContext } from '../../ThemeContext';
import Menubar from '../../global/Menubar';
import Topbar from '../../global/Topbar';
import Title from '../../global/Title';
import { Row, Col, Card, message, Button } from 'antd';
import { MdOutlineMonetizationOn, MdContentCopy, MdPayments, MdPriceChange, MdLocalPrintshop } from 'react-icons/md';
import { useSelector } from 'react-redux';
import FixeCRBTModal from './modals/FixeCRBTModal';  
import CopieColisModal from './modals/CopieColisModal';
import PretPayerModal from './modals/PretPayerModal';
import TarifAjouterModal from './modals/TarifAjouterModal';
import TicketGeneratorModal from './modals/TicketGeneratorModal';

const Tools = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);

  const [isFixeCRBTModalVisible, setIsFixeCRBTModalVisible] = useState(false);
  const [isCopieColisModalVisible, setIsCopieColisModalVisible] = useState(false);
  const [isPretPayerModalVisible, setIsPretPayerModalVisible] = useState(false);
  const [isTarifAjouterModalVisible, setIsTarifAjouterModalVisible] = useState(false);
  const [isTicketGeneratorModalVisible, setIsTicketGeneratorModalVisible] = useState(false);

  const toolsItems = [
    {
      id: 1,
      name: 'Fixe CRBT',
      description: 'Fix incorrect CRBT values for packages. Enter the tracking code of the package you want to modify.',
      icon: <MdOutlineMonetizationOn style={{ fontSize: '40px', color: theme === 'dark' ? '#1f75cb' : '#1890ff' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#f0f5ff',
      buttonColor: theme === 'dark' ? '#1f75cb' : '#1890ff'
    },
    {
      id: 2,
      name: 'Copie Colis',
      description: 'Create a duplicate of an existing package with all its details. Useful for creating similar packages quickly.',
      icon: <MdContentCopy style={{ fontSize: '40px', color: theme === 'dark' ? '#3da53d' : '#52c41a' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#f6ffed',
      buttonColor: theme === 'dark' ? '#3da53d' : '#52c41a'
    },
    {
      id: 3,
      name: 'Prêt à Payer',
      description: 'Toggle le statut de paiement d\'un colis. Entrez le code de suivi du colis à modifier.',
      icon: <MdPayments style={{ fontSize: '40px', color: theme === 'dark' ? '#9c27b0' : '#673ab7' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#f3e5f5',
      buttonColor: theme === 'dark' ? '#9c27b0' : '#673ab7'
    },
    {
      id: 4,
      name: 'Prix Ajouter',
      description: 'View and update additional pricing for packages. Enter the tracking code to manage extra fees.',
      icon: <MdPriceChange style={{ fontSize: '40px', color: theme === 'dark' ? '#ff6b6b' : '#f50057' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#fce4ec',
      buttonColor: theme === 'dark' ? '#ff6b6b' : '#f50057'
    },
    {
      id: 5,
      name: 'Générateur de Tickets',
      description: 'Créer et personnaliser des tickets de livraison au format 450x450.',
      icon: <MdLocalPrintshop style={{ fontSize: '40px', color: theme === 'dark' ? '#2196f3' : '#1976d2' }} />,
      bgColor: theme === 'dark' ? '#1f1f1f' : '#e3f2fd',
      buttonColor: theme === 'dark' ? '#2196f3' : '#1976d2'
    },
  ];

  const handleToolClick = (tool) => {
    if (tool.name === 'Fixe CRBT') {
      setIsFixeCRBTModalVisible(true);
    } else if (tool.name === 'Copie Colis') {
      setIsCopieColisModalVisible(true);
    } else if (tool.name === 'Prêt à Payer') {
      setIsPretPayerModalVisible(true);
    } else if (tool.name === 'Prix Ajouter') {
      setIsTarifAjouterModalVisible(true);
    } else if (tool.name === 'Générateur de Tickets') {
      setIsTicketGeneratorModalVisible(true);
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
                    className="tool-card"
                    style={{
                      textAlign: 'center',
                      backgroundColor: tool.bgColor,
                      border: `1px solid ${theme === 'dark' ? '#303030' : '#e8e8e8'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    bodyStyle={{
                      padding: '24px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="tool-content">
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
                        marginBottom: '12px'
                      }}>
                        {tool.name}
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: theme === 'dark' ? '#rgba(255,255,255,0.8)' : '#666',
                        marginBottom: '16px'
                      }}>
                        {tool.description}
                      </p>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => handleToolClick(tool)}
                      style={{
                        backgroundColor: tool.buttonColor,
                        borderColor: tool.buttonColor,
                        width: '100%',
                        marginTop: 'auto'
                      }}
                    >
                      Use Tool
                    </Button>
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
      <PretPayerModal
        visible={isPretPayerModalVisible}
        onCancel={() => setIsPretPayerModalVisible(false)}
      />
      <TarifAjouterModal
        visible={isTarifAjouterModalVisible}
        onCancel={() => setIsTarifAjouterModalVisible(false)}
      />
      <TicketGeneratorModal
        visible={isTicketGeneratorModalVisible}
        onCancel={() => setIsTicketGeneratorModalVisible(false)}
      />
    </div>
  );
};

export default Tools;
