// components/ColisTable/FilterBar.jsx

import React from 'react';
import { Button, Select, DatePicker, Avatar } from 'antd';
import { FaSearch } from 'react-icons/fa';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * FilterBar component handles the filter inputs and actions.
 *
 * Props:
 * - filters: current filter state
 * - handleFilterChange: function to handle changes in filter inputs
 * - handleDateRangeChange: function to handle date range changes
 * - handleApplyFilters: function to apply filters
 * - handleResetFilters: function to reset filters
 * - stores: array of store objects
 * - villes: array of ville objects
 * - allowedStatuses: array of allowed status strings
 * - user: current user object
 * - theme: 'dark' or 'light'
 */
const FilterBar = React.memo(({
  filters,
  handleFilterChange,
  handleDateRangeChange,
  handleApplyFilters,
  handleResetFilters,
  stores,
  villes,
  allowedStatuses,
  user,
  theme,
}) => {
  return (
    <div className="filter_bar" style={{ margin: '16px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {/* Store Selection (admin only) */}
      {user?.role === 'admin' && (
        <div className="colis-form-input" style={{ flex: '1 1 200px' }}>
          <label>Magasin</label>
          <Select
            showSearch
            placeholder="Sélectionner un magasin"
            value={filters.store || undefined}
            onChange={(value) => handleFilterChange(value, 'store')}
            className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
            style={{ width: '100%' }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
          >
            {stores.map((store) => (
              <Option key={store._id} value={store._id} label={store.storeName}>
                <Avatar src={store.image?.url} style={{ marginRight: '8px' }} />
                {store.storeName}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Ville Selection */}
      <div className="colis-form-input" style={{ flex: '1 1 200px' }}>
        <label>Ville</label>
        <Select
          showSearch
          placeholder="Rechercher une ville"
          value={filters.ville || undefined}
          onChange={(value) => handleFilterChange(value, 'ville')}
          className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
          style={{ width: '100%' }}
          optionFilterProp="label"
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {villes.map((ville) => (
            <Option key={ville._id} value={ville._id} label={ville.nom}>
              {ville.nom}
            </Option>
          ))}
        </Select>
      </div>

      {/* Statut Selection */}
      <div className="colis-form-input" style={{ flex: '1 1 200px' }}>
        <label>Statut</label>
        <Select
          showSearch
          placeholder="Sélectionner un statut"
          value={filters.statut || undefined}
          onChange={(value) => handleFilterChange(value, 'statut')}
          className={`colis-select-ville ${theme === 'dark' ? 'dark-mode' : ''}`}
          style={{ width: '100%' }}
          optionFilterProp="label"
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {allowedStatuses.map((status, index) => (
            <Option key={index} value={status} label={status}>
              {status}
            </Option>
          ))}
        </Select>
      </div>

      {/* Date Range Picker */}
      <div className="colis-form-input" style={{ flex: '1 1 300px' }}>
        <label>Date de Création</label>
        <RangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          allowClear
        />
      </div>

      {/* Apply Filters Button */}
      <div className="colis-form-input" style={{ flex: '1 1 150px', alignSelf: 'end' }}>
        <Button 
          type="primary" 
          onClick={handleApplyFilters} 
          style={{ width: '100%' }}
          icon={<FaSearch />}
        >
          Filter
        </Button>
      </div>
      
      {/* Reset Filters Button */}
      <div className="colis-form-input" style={{ flex: '1 1 100px', alignSelf: 'end' }}>
        <Button 
          type="default" 
          onClick={handleResetFilters} 
          style={{ width: '100%' }}
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
});

export default FilterBar;
