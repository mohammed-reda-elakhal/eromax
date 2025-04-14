// components/ColisTable/FilterBar.jsx

import React from 'react';
import { Button, Select, Input, Avatar, Row, Col } from 'antd';
import { FaSearch } from 'react-icons/fa';

const { Option } = Select;

/**
 * FilterBar component handles the filter inputs and actions.
 *
 * Props:
 * - filters: current filter state
 * - handleFilterChange: function to handle changes in filter inputs
 * - handleApplyFilters: function to apply filters
 * - handleResetFilters: function to reset filters
 * - stores: array of store objects
 * - villes: array of ville objects
 * - allowedStatuses: array of allowed status strings
 * - livreurs: array of livreur objects
 * - user: current user object
 * - theme: 'dark' or 'light'
 * - startDate: start date for custom date range
 * - endDate: end date for custom date range
 * - handleStartDateChange: function to handle start date changes
 * - handleEndDateChange: function to handle end date changes
 */
const FilterBar = React.memo(({
  filters,
  handleFilterChange,
  handleApplyFilters,
  handleResetFilters,
  stores,
  villes,
  allowedStatuses,
  livreurs,
  user,
  theme,
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
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

      {/* **Livreur Selection (New Filter) */}
      {user?.role === 'admin' && (
        <div className="colis-form-input" style={{ flex: '1 1 200px' }}>
            <label>Livreur</label>
            <Select
            showSearch
            placeholder="Sélectionner un livreur"
            value={filters.livreur || undefined}
            onChange={(value) => handleFilterChange(value, 'livreur')}
            className={`colis-select-livreur ${theme === 'dark' ? 'dark-mode' : ''}`}
            style={{ width: '100%' }}
            optionFilterProp="label"
            filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
            }
            allowClear
            >
            {livreurs.map((livreur) => (
                <Option key={livreur._id} value={livreur._id} label={`${livreur.nom} ${livreur.prenom}`}>
                <Avatar src={livreur.profile?.url} style={{ marginRight: '8px' }} />
                {livreur.nom} {livreur.prenom}
                </Option>
            ))}
            </Select>
        </div>
       )}

      {/* Date Range Type Selector */}
      <div className="colis-form-input" style={{ flex: '1 1 200px' }}>
        <label>Période</label>
        <Select
          value={filters.dateRangeType}
          onChange={(value) => handleFilterChange(value, 'dateRangeType')}
          style={{ width: '100%' }}
          className={`colis-select-date-range ${theme === 'dark' ? 'dark-mode' : ''}`}
        >
          <Option value="last_week">Dernière semaine</Option>
          <Option value="last_2_weeks">2 dernières semaines</Option>
          <Option value="last_month">Dernier mois</Option>
          <Option value="last_2_months">2 derniers mois</Option>
          <Option value="last_6_months">6 derniers mois</Option>
          <Option value="custom">Personnalisé</Option>
        </Select>
      </div>

      {/* Custom Date Range */}
      {filters.dateRangeType === 'custom' && (
        <div className="colis-form-input" style={{ flex: '1 1 300px' }}>
          <label>Date Personnalisée</label>
          <Row gutter={8}>
            <Col span={12}>
              <Input
                type="date"
                placeholder="Date début"
                onChange={handleStartDateChange}
                value={startDate ? startDate.format('YYYY-MM-DD') : ''}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Input
                type="date"
                placeholder="Date fin"
                onChange={handleEndDateChange}
                value={endDate ? endDate.format('YYYY-MM-DD') : ''}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* Apply Filters Button */}
      <div className="colis-form-input" style={{ flex: '1 1 150px', alignSelf: 'end' }}>
        <Button
          type="primary"
          onClick={handleApplyFilters}
          style={{ width: '100%' }}
          icon={<FaSearch />}
        >
          Filtrer
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
