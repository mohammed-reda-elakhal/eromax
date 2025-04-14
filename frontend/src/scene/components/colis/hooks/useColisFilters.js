// components/ColisTable/hooks/useColisFilters.js

import { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { colisActions } from '../../../../redux/slices/colisSlice';
import { toast } from 'react-toastify';

/**
 * Custom hook to manage filter state and logic.
 */
export default function useColisFilters() {
  const dispatch = useDispatch();
  const { dateRange: selectedDateRange } = useSelector(state => state.colis);

  const [filters, setFilters] = useState({
    store: '',
    ville: '',
    statut: '',
    livreur: '',
    dateRangeType: selectedDateRange || 'last_month', // Default to last month
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({
    store: '',
    ville: '',
    statut: '',
    livreur: '',
    dateFrom: '',
    dateTo: '',
    dateRange: selectedDateRange || 'last_month',
  });

  // Reset date inputs when changing date range type
  useEffect(() => {
    if (filters.dateRangeType !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  }, [filters.dateRangeType]);

  const queryParams = useMemo(() => ({
    statut: appliedFilters.statut,
    store: appliedFilters.store,
    ville: appliedFilters.ville,
    livreur: appliedFilters.livreur,
    dateFrom: appliedFilters.dateFrom,
    dateTo: appliedFilters.dateTo,
    dateRange: appliedFilters.dateRange,
  }), [appliedFilters]);

  const handleFilterChange = (value, key) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));

    // If changing dateRangeType, update Redux state
    if (key === 'dateRangeType') {
      dispatch(colisActions.setDateRange(value));
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value ? moment(e.target.value).startOf('day') : null;
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value ? moment(e.target.value).endOf('day') : null;
    setEndDate(newEndDate);
  };

  const fetchData = async () => {
    const { store, ville, statut, livreur, dateRangeType } = filters;

    // For custom date range, use the selected dates
    if (dateRangeType === 'custom') {
      if (startDate && endDate) {
        // Update Redux state for custom date range
        dispatch(colisActions.setCustomDateRange({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }));

        const newFilters = {
          store: store || '',
          ville: ville || '',
          statut: statut || '',
          livreur: livreur || '',
          dateFrom: startDate ? startDate.toISOString() : '',
          dateTo: endDate ? endDate.toISOString() : '',
          dateRange: '', // Don't send 'custom' to the backend, we'll use dateFrom/dateTo instead
        };

        setAppliedFilters(newFilters);
      } else {
        toast.info('Veuillez sélectionner une plage de dates');
        return;
      }
    } else {
      // For predefined ranges, use the dateRangeType
      const newFilters = {
        store: store || '',
        ville: ville || '',
        statut: statut || '',
        livreur: livreur || '',
        dateFrom: '',
        dateTo: '',
        dateRange: dateRangeType,
      };

      setAppliedFilters(newFilters);
    }
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    // Reset to default (last month)
    dispatch(colisActions.setDateRange('last_month'));

    setFilters({
      store: '',
      ville: '',
      statut: '',
      livreur: '',
      dateRangeType: 'last_month',
    });

    setStartDate(null);
    setEndDate(null);

    setAppliedFilters({
      store: '',
      ville: '',
      statut: '',
      livreur: '',
      dateFrom: '',
      dateTo: '',
      dateRange: 'last_month',
    });
  };

  return {
    filters,
    appliedFilters,
    queryParams,
    handleFilterChange,
    handleApplyFilters,
    handleResetFilters,
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
    setFilters,
  };
}
