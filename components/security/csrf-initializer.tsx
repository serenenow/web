'use client';

import { useEffect } from 'react';
import { initializeCSRFProtection } from '@/lib/utils/csrf-protection';
import { logger } from '@/lib/utils/logger';

/**
 * CSRFInitializer component
 * 
 * This component initializes CSRF protection when the app loads.
 * It fetches a CSRF token from the server and stores it for use in API requests.
 * 
 * This component should be included in the app layout or a top-level component
 * that is rendered on every page.
 */
export default function CSRFInitializer() {
  useEffect(() => {
    // Initialize CSRF protection when the component mounts
    const initCSRF = async () => {
      try {
        await initializeCSRFProtection();
      } catch (error) {
        logger.error('Failed to initialize CSRF protection:', error);
      }
    };
    
    initCSRF();
  }, []);
  
  // This component doesn't render anything
  return null;
}
