import React, { useState } from 'react';
import { Table } from 'antd';
import './TableDashboard.css';

const TableDashboard = ({
  column,
  data,
  id,
  theme,
  onSelectChange,
  loading,
  rowSelection,
  ...rest
}) => {
  const [pagination, setPagination] = useState({
    pageSizeOptions: ['5', '10', '20', '30', '50', '100', '500'],
    showSizeChanger: true,
    defaultPageSize: 50,
    showTotal: (total, range) => `${range[1]} of ${total}`,
    current: 1,
    pageSize: 30,
  });

  const handleTableChange = (pag, filters, sorter) => {
    setPagination((prev) => ({
      ...prev,
      ...pag,
    }));
  };

  return (
    // Wrap table in a container that enables horizontal scrolling
    <div
      className={`table-container ${theme === 'dark' ? 'table-container-dark' : 'table-container-light'}`}
      style={{
        overflowX: 'auto',
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: theme === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: theme === 'dark'
          ? '1px solid #334155'
          : '1px solid #e2e8f0'
      }}>
      <Table
        columns={column}
        dataSource={data}
        rowKey={id}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `Affichage ${range[0]}-${range[1]} sur ${total} éléments`,
          style: {
            marginTop: '16px',
            textAlign: 'center'
          }
        }}
        onChange={handleTableChange}
        className={theme === 'dark' ? 'table-dark' : 'table-light'}
        loading={loading}
        rowSelection={rowSelection}
        size="middle"
        bordered={false}
        scroll={{
          x: 'max-content',
          y: window.innerWidth <= 768 ? 400 : 600
        }}
        style={{
          tableLayout: 'auto',
          background: 'transparent'
        }}
        {...rest}
      />
    </div>
  );
};

export default TableDashboard;
