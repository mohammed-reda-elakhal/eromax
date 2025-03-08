import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Badge, Button, Tag, Modal, List, Typography, message } from 'antd';
import { PlusCircleFilled, CopyOutlined } from '@ant-design/icons';
import ColisFilterBar from '../components/ColisFilterBar';
import ColisTable from '../components/ColisTable';
import '../colis.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStatisticColisReporteeProg } from '../../../../redux/apiCalls/staticsApiCalls';

function ColisList({ search }) {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { colisReporteeProg } = useSelector((state) => ({
    colisReporteeProg: state.statics.colisReporteeProg,
    /* Expected response format:
       {
         "message": "List of codes and count retrieved successfully.",
         "count": 2,
         "codes": [
           { "code_suivi": "KTR20250303-JN1I6O" },
           { "code_suivi": "KTR20250307-UPPJKH" }
         ],
         "userRole": "admin"
       }
    */
  }));

  // State to control modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getStatisticColisReporteeProg());
  }, [dispatch]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Function to copy the code and display a success message
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success('Code copied to clipboard!');
    });
  };

  // Dark theme custom styles for your select components
  const darkStyle = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      color: '#fff',
      borderColor: 'gray',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'gray',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: '#fff',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      color: '#fff',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? '#444' : isSelected ? '#555' : undefined,
      color: isFocused || isSelected ? '#fff' : '#ccc',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: 'gray',
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: 'gray',
    }),
    calendarContainer: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      color: '#fff',
    }),
    day: (styles) => ({
      ...styles,
      color: '#fff',
    }),
    datePickerInput: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fff',
    }),
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
          }}
        >
          <div className="page-content-header">
            <Title nom="List Colis" />
            {user?.role === "client" ? (
              <Link to={`/dashboard/ajouter-colis/simple`} className="btn-dashboard">
                <PlusCircleFilled style={{ marginRight: "8px" }} />
                Ajouter Colis
              </Link>
            ) : ""}
          </div>
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', flexDirection: "column", marginBottom: "8px" }}>
              <h4>List Colis</h4>
              <Badge count={colisReporteeProg.count}>
                <Tag style={{ cursor: "pointer" }} color="blue" onClick={showModal}>
                  <Badge status="processing" text="Colis Reportée ou Programmée" />
                </Tag>
              </Badge>
            </div>
            <ColisTable theme={theme} darkStyle={darkStyle} search={search} />
          </div>
        </div>

        {/* Modal displaying the codes list with an improved design */}
        <Modal
          title="List of Colis Codes"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>
          ]}
        >
          {colisReporteeProg.codes && colisReporteeProg.codes.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={colisReporteeProg.codes}
              renderItem={(item) => (
                <List.Item
                  style={{
                    background: theme === 'dark' ? '#141414' : '#f0f2f5',
                    border: '1px solid #d9d9d9',
                    borderRadius: '5px',
                    marginBottom: '8px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Typography.Text
                    style={{ cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}
                    onClick={() => handleCopyCode(item.code_suivi)}
                  >
                    {item.code_suivi}
                  </Typography.Text>
                  <CopyOutlined
                    style={{ fontSize: '16px', color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => handleCopyCode(item.code_suivi)}
                  />
                </List.Item>
              )}
            />
          ) : (
            <p>No codes available.</p>
          )}
        </Modal>
      </main>
    </div>
  );
}

export default ColisList;
