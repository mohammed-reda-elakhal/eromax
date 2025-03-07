import React, { useState } from 'react';
import { Table } from 'antd';

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
    <div style={{ overflowX: 'auto' }}>
      <Table
        columns={column}
        dataSource={data}
        rowKey={id}
        pagination={pagination}
        onChange={handleTableChange}
        className={theme === 'dark' ? 'table-dark' : 'table-light'}
        loading={loading}
        rowSelection={rowSelection}
        size="small"
        bordered
        scroll={{ x: 1800 }} // Set fixed width for table and enable horizontal scroll if needed
        style={{ tableLayout: 'fixed' }}
        {...rest}
      />
    </div>
  );
};

export default TableDashboard;
