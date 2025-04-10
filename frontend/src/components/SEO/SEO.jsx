import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for managing all meta tags, titles, and other SEO-related elements
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords (comma separated)
 * @param {string} props.canonicalUrl - Canonical URL for the page
 * @param {string} props.ogType - Open Graph type (default: website)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogImageAlt - Open Graph image alt text
 * @param {Object} props.structuredData - Structured data (JSON-LD) for the page
 */
const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  structuredData,
}) => {
  // Default values for the website
  const defaultTitle = 'Eromax - Delivery and Logistics Services';
  const defaultDescription = 'Eromax provides reliable delivery and logistics services for businesses and individuals.';
  const defaultKeywords = 'delivery, logistics, shipping, courier, packages';
  const siteUrl = window.location.origin;
  
  // Use provided values or defaults
  const pageTitle = title ? `${title} | Eromax` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = canonicalUrl || window.location.href;
  const pageImage = ogImage || `${siteUrl}/logo192.png`; // Using the default logo if no image provided
  
  return (
    <Helmet prioritizeSeoTags>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
