import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  googleVerification?: string;
}

export default function SEO({ 
  title, 
  description = "Discover the latest bursaries, internships, jobs, and educational opportunities in South Africa. OpportunityHub SA is your gateway to a brighter future.",
  canonical,
  ogType = "website",
  ogImage = "https://opportunityhubsa.co.za/og-image.png", // Replace with actual OG image if available
  keywords = "bursaries, internships, jobs South Africa, education, youth opportunities, scholarship, SA jobs, career development",
  googleVerification
}: SEOProps) {
  const siteTitle = "OpportunityHub SA";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Site Verification */}
      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}
      
      {/* Other SEO essentials */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#10b981" />
    </Helmet>
  );
}
