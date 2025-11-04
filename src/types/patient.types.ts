// Patient-specific types for OdontoLink

export interface Patient {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  healthInsurance?: string;
  bloodType?: string;
  active: boolean;
}

export interface PatientProfile extends Patient {
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface PatientStats {
  upcomingAppointments: number;
  activeAttentions: number;
  completedAttentions: number;
  availableTreatments: number;
}

export interface AppointmentBookingRequest {
  offeredTreatmentId: number;
  appointmentTime: string; // ISO 8601 format
}
