import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';

function TableDashboard({column , data , id , theme , onSelectChange}) {
  const [client , setClient] = useState(false)
  
  const rowSelection = {
    onChange: onSelectChange,
  };





  return (
        <Table 
          columns={column} 
          dataSource={data} 
          rowKey={id}
          pagination={{ 
            pageSizeOptions: ['5', '10', '20', '50' , '100 '], // Options for page size
            showSizeChanger: true, // Enable the page size changer
            defaultPageSize: 10, // Default page size
          }} 
          className={theme === 'dark' ? 'table-dark' : 'table-light'}
          {...(!client && { rowSelection })}
        />
  );
}

export default TableDashboard;
