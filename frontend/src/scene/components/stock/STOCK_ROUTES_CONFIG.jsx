/**
 * ============================================================
 * STOCK MANAGEMENT - ROUTES CONFIGURATION
 * ============================================================
 * 
 * Add these routes to your App.jsx or routing configuration
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StockManagementClient from './pages/StockManagementClient';
import StockManagementAdmin from './pages/StockManagementAdmin';
import StockDetail from './pages/StockDetail';

// Example Route Configuration
const StockRoutes = () => {
    return (
        <Routes>
            {/* Client Routes */}
            <Route path="/mes-stocks" element={<StockManagementClient />} />
            <Route path="/stock/:stockId" element={<StockDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin/stock-management" element={<StockManagementAdmin />} />
            <Route path="/admin/stock/:stockId" element={<StockDetail />} />
        </Routes>
    );
};

export default StockRoutes;


/**
 * ============================================================
 * MENU CONFIGURATION
 * Add to your sidebar/navigation menu
 * ============================================================
 */

// For Client Menu
export const clientStockMenu = {
    key: 'stock',
    icon: '📦',
    label: 'Mon Stock',
    path: '/mes-stocks',
    // Only show if client has stock_management access
    visible: (user) => user?.features_access?.stock_management === true
};

// For Admin Menu
export const adminStockMenu = {
    key: 'stock-management',
    icon: '📦',
    label: 'Gestion de Stock',
    path: '/admin/stock-management',
    badge: 'pendingCount', // Show count of pending stocks
    children: [
        {
            key: 'stock-pending',
            label: 'En Attente',
            path: '/admin/stock-management?tab=pending'
        },
        {
            key: 'stock-all',
            label: 'Tous les Stocks',
            path: '/admin/stock-management?tab=all'
        },
        {
            key: 'stock-alerts',
            label: 'Alertes',
            path: '/admin/stock-management?tab=alerts'
        }
    ]
};


/**
 * ============================================================
 * EXAMPLE: Add to your existing App.jsx
 * ============================================================
 */

/*
import StockManagementClient from './scene/components/stock/pages/StockManagementClient';
import StockManagementAdmin from './scene/components/stock/pages/StockManagementAdmin';
import StockDetail from './scene/components/stock/pages/StockDetail';

// Inside your Routes:
<Route path="/mes-stocks" element={<StockManagementClient />} />
<Route path="/stock/:stockId" element={<StockDetail />} />
<Route path="/admin/stock-management" element={<StockManagementAdmin />} />
*/


/**
 * ============================================================
 * EXAMPLE: Conditional Menu Rendering
 * ============================================================
 */

/*
// In your menu component:
const menuItems = [
  // ... your existing menu items
  
  // Stock management for clients (conditional)
  ...(user?.features_access?.stock_management ? [{
    key: 'stock',
    icon: <InboxOutlined />,
    label: 'Mon Stock',
    onClick: () => navigate('/mes-stocks')
  }] : []),
  
  // Stock management for admins
  ...(user?.role === 'admin' ? [{
    key: 'stock-admin',
    icon: <InboxOutlined />,
    label: 'Gestion de Stock',
    onClick: () => navigate('/admin/stock-management')
  }] : [])
];
*/

