import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for better search engine optimization
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords
 * @param {string} props.canonicalUrl - Canonical URL
 * @param {string} props.ogType - Open Graph type
 * @param {string} props.ogImage - Open Graph image URL
 */
const SEO = ({
  title = 'Eromax - Service de Livraison au Maroc',
  description = 'Service de livraison rapide et fiable au Maroc. Suivi de colis en temps réel.',
  keywords = 'livraison, Maroc, colis, suivi, express, Eromax, logistique, e-commerce',
  canonicalUrl = 'https://www.eromax.ma',
  ogType = 'website',
  ogImage = 'https://www.eromax.ma/logo.png',
}) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
