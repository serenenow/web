/**
 * Content Security Policy (CSP) Configuration
 * 
 * This utility provides CSP configuration for the SereneNow web application.
 * CSP helps prevent XSS attacks by controlling which resources can be loaded.
 */

/**
 * Generate the Content Security Policy header value
 * @returns The CSP header value as a string
 */
export function generateCSP(): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js
      "https://sdk.cashfree.com", // Cashfree SDK
      "https://api.serenenow.com", // API domain
      "http://localhost:8080", // Local API server
      "https://kmp-production.up.railway.app", // Production API server
      "https://www.google-analytics.com", // Google Analytics
    ],
    'style-src': ["'self'", "'unsafe-inline'"], // Unsafe-inline needed for styled-components
    'img-src': ["'self'", "data:", "https:", "blob:"], // Allow images from any HTTPS source
    'font-src': ["'self'", "data:", "https://fonts.gstatic.com"],
    'connect-src': [
      "'self'", 
      "https://api.serenenow.com", 
      "https://sdk.cashfree.com",
      "https://www.google-analytics.com",
      "http://localhost:8080", // Local API server
      "https://kmp-production.up.railway.app" // Production API server
    ],
    'frame-src': [
      "'self'", 
      "https://sdk.cashfree.com",
      "https://sandbox.cashfree.com", // Cashfree sandbox iframe
      "https://api.cashfree.com" // Cashfree production iframe
    ], // For payment iframe
    'object-src': ["'none'"], // Restrict <object>, <embed>, and <applet> elements
    'base-uri': ["'self'"], // Restrict base URIs
    'form-action': [
      "'self'", 
      "https://sandbox.cashfree.com", // Cashfree sandbox form submissions
      "https://api.cashfree.com" // Cashfree production form submissions
    ], // Restrict form submissions
    'frame-ancestors': ["'self'"], // Restrict framing to same origin
    'upgrade-insecure-requests': [], // Force HTTPS
  };

  // Convert the policies object to a CSP string
  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Generate CSP meta tag content for use in Next.js Head component
 * @returns The CSP content for a meta tag
 */
export function generateCSPMetaTag(): string {
  return generateCSP();
}
