// Appointment status enum matching backend Kotlin enum
export enum AppointmentStatus {
  PAYMENT_PENDING = "PAYMENT_PENDING",
  NEEDS_APPROVAL = "NEEDS_APPROVAL", 
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
  PAYMENT_FAILED = "PAYMENT_FAILED"
}

// Filter types for appointments
export type AppointmentFilter = "all" | "upcoming" | "past"
