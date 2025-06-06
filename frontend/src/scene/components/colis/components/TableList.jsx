// components/ColisTable/TableList.jsx

import React, { useMemo } from 'react';
import TableDashboard from '../../../global/TableDashboard';

/**
 * TableList component handles the table display.
 *
 * Props:
 * - columns: array of column definitions
 * - data: array of data objects
 * - loading: boolean indicating loading state
 * - rowSelection: object for row selection (Ant Design Table)
 * - theme: 'dark' or 'light'
 */
const TableList = React.memo(({
  columns,
  data,
  loading,
  rowSelection,
  theme,
}) => {
  // Memoize columns to prevent re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  return (
    <TableDashboard
      column={memoizedColumns}
      data={data}
      id="_id"
      theme={theme}
      rowSelection={rowSelection}
      loading={loading}
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.08)' :'#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    />
  );
});

export default TableList;
