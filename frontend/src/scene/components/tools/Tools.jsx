import React, { useContext, useState } from 'react';
import './tools.css';
import { ThemeContext } from '../../ThemeContext';
import Menubar from '../../global/Menubar';
import Topbar from '../../global/Topbar';
import Title from '../../global/Title';
import { Row, Col, Card, message } from 'antd';
import { MdOutlineMonetizationOn } from 'react-icons/md';
import { useSelector } from 'react-redux';
import FixeCRBTModal from './modals/FixeCRBTModal';  // Import the modal component

const Tools = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);

  // Dynamic list of tools (items)
  const toolsItems = [
    {
      id: 1,
      name: 'Fixe CRBT',
      icon: <MdOutlineMonetizationOn style={{ fontSize: '32px', color: '#1890ff' }} />,
    },
    // Add more tools here if needed
  ];

  // Local state to control the visibility of the Fixe CRBT modal
  const [isFixeCRBTModalVisible, setIsFixeCRBTModalVisible] = useState(false);

  // When a tool is clicked
  const handleToolClick = (tool) => {
    if (tool.name === 'Fixe CRBT') {
      setIsFixeCRBTModalVisible(true);
    } else {
      message.info(`Clicked on ${tool.name}`);
    }
  };

  // Handler to close the modal
  const handleModalCancel = () => {
    setIsFixeCRBTModalVisible(false);
  };

  // Handler to perform the "fix CRBT" action. You can integrate your API call or Redux action here.
  const handleFixCRBT = async (codeSuivi) => {
    console.log("Fixing CRBT for code:", codeSuivi);
    // Simulate an API call delay (replace with your actual API/Redux logic)
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
          <div className="content">
            <Title title="Tools" />
            <Row gutter={[16, 16]}>
              {toolsItems.map((tool) => (
                <Col key={tool.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card
                    hoverable
                    onClick={() => handleToolClick(tool)}
                    style={{ textAlign: 'center' }}
                  >
                    <div>{tool.icon}</div>
                    <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                      {tool.name}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </main>
      {/* Render the Fixe CRBT modal */}
      <FixeCRBTModal
        visible={isFixeCRBTModalVisible}
        onCancel={handleModalCancel}
        onFix={handleFixCRBT}
      />
    </div>
  );
};

export default Tools;
