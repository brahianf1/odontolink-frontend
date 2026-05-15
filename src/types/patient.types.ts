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

export interface AppointmentBookingRequest {
  offeredTreatmentId: number;
  appointmentTime: string;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type OfferedTreatmentSortField =
  | 'treatmentName'
  | 'specialty'
  | 'duration'
  | 'offerStartDate'
  | 'offerEndDate'
  | 'id';

export type SortDirection = 'ASC' | 'DESC';

export interface SearchTreatmentsParams {
  keyword?: string;
  specialty?: string;
  availability?: DayOfWeek;
  page?: number;
  size?: number;
  sortBy?: OfferedTreatmentSortField;
  sortDirection?: SortDirection;
}
