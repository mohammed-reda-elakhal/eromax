import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component specifically for dashboard pages
 * These pages should generally be protected from search engine indexing
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description (optional)
 */
const DashboardSEO = ({
  title,
  description,
}) => {
  // Default values for dashboard pages
  const defaultTitle = 'Eromax Dashboard';
  const defaultDescription = 'Eromax dashboard for managing your logistics and delivery services.';
  
  // Use provided values or defaults
  const pageTitle = title ? `${title} | Eromax Dashboard` : defaultTitle;
  const pageDescription = description || defaultDescription;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
};

export default DashboardSEO;
