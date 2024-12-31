// components/ColisTable/hooks/useColisFilters.js

import { useState, useMemo } from 'react';
import moment from 'moment';

/**
 * Custom hook to manage filter state and logic.
 */
export default function useColisFilters() {
  const [filters, setFilters] = useState({
    store: '',
    ville: '',
    statut: '',
    dateRange: [],
  });

  const [appliedFilters, setAppliedFilters] = useState({
    store: '',
    ville: '',
    statut: '',
    dateFrom: '',
    dateTo: '',
  });

  const queryParams = useMemo(() => ({
    statut: appliedFilters.statut,
    store: appliedFilters.store,
    ville: appliedFilters.ville,
    dateFrom: appliedFilters.dateFrom,
    dateTo: appliedFilters.dateTo,
  }), [appliedFilters]);

  const handleFilterChange = (value, key) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates,
    }));
  };

  const handleApplyFilters = () => {
    const { store, ville, statut, dateRange } = filters;
    setAppliedFilters({
      store: store || '',
      ville: ville || '',
      statut: statut || '',
      dateFrom: dateRange[0] ? moment(dateRange[0]).startOf('day').toISOString() : '',
      dateTo: dateRange[1] ? moment(dateRange[1]).endOf('day').toISOString() : '',
    });
  };

  const handleResetFilters = () => {
    setFilters({
      store: '',
      ville: '',
      statut: '',
      dateRange: [],
    });
    setAppliedFilters({
      store: '',
      ville: '',
      statut: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  return {
    filters,
    appliedFilters,
    queryParams,
    handleFilterChange,
    handleDateRangeChange,
    handleApplyFilters,
    handleResetFilters,
    setFilters,
  };
}
