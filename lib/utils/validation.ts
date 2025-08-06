/**
 * Input Validation Utilities
 * 
 * This module provides utilities for validating input data before sending to APIs.
 * It helps prevent injection attacks and ensures data integrity.
 */

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format (basic validation)
 * @param phone The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, plus, and parentheses
  const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates that a string is not empty and within length limits
 * @param str The string to validate
 * @param minLength Minimum length (default: 1)
 * @param maxLength Maximum length (default: 255)
 * @returns True if the string is valid, false otherwise
 */
export function isValidString(str: string, minLength = 1, maxLength = 255): boolean {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates a date string format (YYYY-MM-DD)
 * @param dateStr The date string to validate
 * @returns True if the date string is valid, false otherwise
 */
export function isValidDateString(dateStr: string): boolean {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  // Check if the date string matches the parsed date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return dateStr === `${year}-${month}-${day}`;
}

/**
 * Validates a time string format (HH:MM)
 * @param timeStr The time string to validate
 * @returns True if the time string is valid, false otherwise
 */
export function isValidTimeString(timeStr: string): boolean {
  // Check format
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  
  // Check if hours and minutes are valid
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

/**
 * Validates that a value is a number within specified range
 * @param value The value to validate
 * @param min Minimum value (default: 0)
 * @param max Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @returns True if the value is a valid number within range, false otherwise
 */
export function isValidNumber(value: any, min = 0, max = Number.MAX_SAFE_INTEGER): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param str The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates an object against a schema of required fields and their validators
 * @param data The object to validate
 * @param schema The validation schema
 * @returns An object with isValid flag and any validation errors
 */
export function validateObject<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, (value: any) => boolean>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const validator = schema[key];
      const value = data[key];
      
      if (!validator(value)) {
        errors[key] = `Invalid value for ${String(key)}`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Creates a validation schema for common booking data
 * @returns A validation schema for booking data
 */
export function createBookingValidationSchema() {
  return {
    expertId: (value: string) => isValidString(value),
    serviceId: (value: string) => isValidString(value),
    selectedService: (value: any) => value && typeof value === 'object',
    date: (value: string) => isValidString(value),
    time: (value: string) => isValidString(value),
    timezone: (value: string) => isValidString(value),
    paymentMode: (value: string) => ['online', 'direct'].includes(value),
    clientName: (value: string) => isValidString(value, 2, 100),
    clientEmail: (value: string) => isValidEmail(value),
    // Optional UTC time fields - if present, they should be valid ISO strings
    startTimeUtc: (value: string) => isValidString(value),
    endTimeUtc: (value: string) => isValidString(value),
  };
}

/**
 * Creates a validation schema for client data
 * @returns A validation schema for client data
 */
export function createClientValidationSchema() {
  return {
    name: (value: string) => isValidString(value, 2, 100),
    email: (value: string) => isValidEmail(value),
    phone: (value: string) => value ? isValidPhone(value) : true, // Optional
  };
}
