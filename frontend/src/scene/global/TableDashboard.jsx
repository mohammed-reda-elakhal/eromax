// TableDashboard.js
import React, { useState } from 'react';
import { Table } from 'antd';

const TableDashboard = ({ column, data, id, theme, onSelectChange, ...rest }) => {
  const [client, setClient] = useState(false);
  
  const rowSelection = {
    onChange: onSelectChange,
  };

  return (
    <Table 
      columns={column} 
      dataSource={data} 
      rowKey={id}
      pagination={{ 
        pageSizeOptions: ['5', '10', '20', '50', '100', '500'], // Options for page size
        showSizeChanger: true, // Enable the page size changer
        defaultPageSize: 50, // Default page size
      }} 
      className={theme === 'dark' ? 'table-dark' : 'table-light'}
      {...(!client && { rowSelection })}
      {...rest} // Spread any additional props (e.g., expandable)
    />
  );
};

export default TableDashboard;
