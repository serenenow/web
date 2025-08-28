/**
 * Storage utilities for handling sensitive and non-sensitive data
 * Provides both encrypted and plain storage options for localStorage/sessionStorage
 */

import { logger } from "./logger";

// Simple encryption using Base64 + basic obfuscation
// Note: This is not true encryption but provides basic obfuscation
// For true encryption, a library like CryptoJS would be needed
function encrypt(data: string): string {
  // Simple obfuscation - in production, use a proper encryption library
  const obfuscated = btoa(
    encodeURIComponent(data)
      .split('')
      .map((char) => String.fromCharCode(char.charCodeAt(0) + 2))
      .join('')
  );
  return `SN_ENC_${obfuscated}`;
}

function decrypt(encryptedData: string): string {
  if (!encryptedData.startsWith('SN_ENC_')) {
    return encryptedData; // Not encrypted with our method
  }
  
  try {
    const obfuscated = encryptedData.replace('SN_ENC_', '');
    const decoded = atob(obfuscated);
    return decodeURIComponent(
      decoded
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) - 2))
        .join('')
    );
  } catch (error) {
    logger.error('Failed to decrypt data:', error);
    return ''; // Return empty string on failure
  }
}

// Storage item with expiration
interface StorageItem<T> {
  value: T;
  expiry?: number; // Timestamp when this item expires
}

// Secure localStorage wrapper
export const secureLocalStorage = {
  setItem<T>(key: string, value: T, expiryMinutes?: number): void {
    if (typeof window === 'undefined') return;
    
    const item: StorageItem<T> = {
      value,
    };
    
    // Add expiration if specified
    if (expiryMinutes) {
      item.expiry = new Date().getTime() + expiryMinutes * 60 * 1000;
    }
    
    const encryptedValue = encrypt(JSON.stringify(item));
    localStorage.setItem(key, encryptedValue);
  },
  
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    
    try {
      const decrypted = decrypt(encryptedValue);
      const item: StorageItem<T> = JSON.parse(decrypted);
      
      // Check if item has expired
      if (item.expiry && new Date().getTime() > item.expiry) {
        localStorage.removeItem(key); // Remove expired item
        return null;
      }
      
      return item.value;
    } catch (error) {
      logger.error(`Error retrieving item ${key} from secure storage:`, error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
};

// Secure sessionStorage wrapper
export const secureSessionStorage = {
  setItem<T>(key: string, value: T, expiryMinutes?: number): void {
    if (typeof window === 'undefined') return;
    
    const item: StorageItem<T> = {
      value,
    };
    
    // Add expiration if specified
    if (expiryMinutes) {
      item.expiry = new Date().getTime() + expiryMinutes * 60 * 1000;
    }
    
    const encryptedValue = encrypt(JSON.stringify(item));
    sessionStorage.setItem(key, encryptedValue);
  },
  
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    const encryptedValue = sessionStorage.getItem(key);
    if (!encryptedValue) return null;
    
    try {
      const decrypted = decrypt(encryptedValue);
      const item: StorageItem<T> = JSON.parse(decrypted);
      
      // Check if item has expired
      if (item.expiry && new Date().getTime() > item.expiry) {
        sessionStorage.removeItem(key); // Remove expired item
        return null;
      }
      
      return item.value;
    } catch (error) {
      logger.error(`Error retrieving item ${key} from secure storage:`, error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
  
  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  }
};

// Plain localStorage wrapper (no encryption)
export const plainLocalStorage = {
  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Handle string values differently to avoid extra quotes
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error(`Error storing item ${key} in plain storage:`, error);
    }
  },
  
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      // Try to parse as JSON, but if it fails, return as is (likely a string)
      try {
        return JSON.parse(value) as T;
      } catch {
        // If parsing fails, it's likely a simple string
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`Error retrieving item ${key} from plain storage:`, error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

// Plain sessionStorage wrapper (no encryption)
export const plainSessionStorage = {
  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Handle string values differently to avoid extra quotes
      if (typeof value === 'string') {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error(`Error storing item ${key} in plain session storage:`, error);
    }
  },
  
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const value = sessionStorage.getItem(key);
      if (!value) return null;
      
      // Try to parse as JSON, but if it fails, return as is (likely a string)
      try {
        return JSON.parse(value) as T;
      } catch {
        // If parsing fails, it's likely a simple string
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`Error retrieving item ${key} from plain session storage:`, error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }
};

/**
 * Clears all storage data (both secure and plain)
 * Use this for logout functionality
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Clear secure storage
  secureLocalStorage.clear();
  secureSessionStorage.clear();
  
  // Clear regular storage
  localStorage.clear();
  sessionStorage.clear();
  
  logger.info('All storage data cleared');
}

// Constants for storage keys to avoid typos and duplication
export const STORAGE_KEYS = {
  CLIENT_AUTH_TOKEN: 'client_auth_token',
  CLIENT_DATA: 'client_data',
  EXPERT_AUTH_TOKEN: 'auth_token',
  EXPERT_DATA: 'expert_data',
  EXPERT_SETUP_PROFILE_COMPLETE: 'setup_complete',
  BOOKING_DATA: 'bookingData',
  BOOKING_SUCCESS_DATA: 'bookingSuccessData',
  PAYMENT_SESSION: 'paymentSession',
  PAYMENT_REFERENCES: 'paymentReferences'
};

// Token expiration time in minutes
export const TOKEN_EXPIRY_MINUTES = 60 * 24; // 24 hours
