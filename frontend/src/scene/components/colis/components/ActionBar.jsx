// components/ColisTable/ActionBar.jsx

import React from 'react';
import { Button, Input } from 'antd';
import { IoMdRefresh } from 'react-icons/io';
import { FaTicketAlt, FaDownload, FaSearch } from 'react-icons/fa';

/**
 * ActionBar component handles action buttons and search input.
 *
 * Props:
 * - onRefresh: function to handle refresh action
 * - onBatchTickets: function to handle batch tickets action
 * - onExport: function to handle export to Excel
 * - selectedRowKeys: array of selected row keys (for enabling/disabling buttons)
 * - onSearch: function to handle search input changes
 * - searchValue: current search input value
 */
const ActionBar = React.memo(({
  onRefresh,
  onBatchTickets,
  onExport,
  selectedRowKeys,
  onSearch,
  searchValue,
}) => {
  return (
    <>
        <div className="action_bar" style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button 
                icon={<IoMdRefresh />} 
                type="primary" 
                onClick={onRefresh} 
                style={{ marginRight: '8px' }}
            >
                Rafraîchir
            </Button>
            <Button 
                icon={<FaTicketAlt />} 
                type="primary" 
                onClick={onBatchTickets}
            >
                Tickets
            </Button>
            <Button 
                icon={<FaDownload />} 
                type="default" 
                onClick={onExport}
                disabled={selectedRowKeys.length === 0}
            >
                Exporter en Excel
            </Button>

            {/* Search Input */}
            
        </div>
        <Input
            placeholder="Recherche ..."
            onChange={onSearch}
            style={{ width: 300 }}
            size="large"
            suffix={<FaSearch />}
            value={searchValue}
            allowClear
        />
    </>
  );
});

export default ActionBar;
