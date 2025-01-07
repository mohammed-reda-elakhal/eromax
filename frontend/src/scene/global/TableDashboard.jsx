// TableDashboard.js

import React, { useState } from 'react';
import { Table } from 'antd';

const TableDashboard = ({ column, data, id, theme, onSelectChange, loading, rowSelection, ...rest }) => {
  const [pagination, setPagination] = useState({
    pageSizeOptions: ['5', '10', '20' ,'30', '50', '100', '500'], // Options for page size
    showSizeChanger: true, // Enable the page size changer
    defaultPageSize: 50, // Default page size
    showTotal: (total, range) => `${range[1]} of ${total}`, // Custom total display
    current: 1, // Initialize current page
    pageSize: 30, // Initialize page size
  });

  const handleTableChange = (pag, filters, sorter) => {
    setPagination(prev => ({
      ...prev, // Retain existing pagination properties
      ...pag,  // Update with new pagination changes (current, pageSize)
    }));
    // If you have additional logic on table change, handle it here
  };
  return (
    <Table 
      columns={column} 
      dataSource={data} 
      rowKey={id}
      pagination={pagination} 
      onChange={handleTableChange} // Handle pagination changes
      className={theme === 'dark' ? 'table-dark' : 'table-light'}
      loading={loading} // Ensure loading prop is passed here
      rowSelection={rowSelection} // Pass rowSelection directly
      {...rest} // Spread any additional props (e.g., expandable)
      size='small'
    />
  );
};

export default TableDashboard;
