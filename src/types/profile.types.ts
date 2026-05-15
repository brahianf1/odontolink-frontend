export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const BLOOD_TYPES: readonly BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

export type RoleCode =
  | 'ROLE_PATIENT'
  | 'ROLE_PRACTITIONER'
  | 'ROLE_SUPERVISOR'
  | 'ROLE_ADMIN';

export interface MyProfileDTO {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
  createdAt?: string;
  active: boolean;
}

export interface UpdateMyProfileRequestDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
}

export interface ChangeMyPasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

export interface ProfilePictureResponseDTO {
  profilePictureUrl: string;
}

export interface PatientDetailsDTO {
  userId: number;
  role: 'ROLE_PATIENT';
  healthInsurance?: string | null;
  bloodType?: BloodType | null;
}

export interface PractitionerDetailsDTO {
  userId: number;
  role: 'ROLE_PRACTITIONER';
  studentId?: string;
  studyYear?: number;
}

export interface SupervisorDetailsDTO {
  userId: number;
  role: 'ROLE_SUPERVISOR';
  specialty?: string;
  employeeId?: string;
}

export interface AdminDetailsDTO {
  userId: number;
  role: 'ROLE_ADMIN';
}

export type MyDetailsDTO =
  | PatientDetailsDTO
  | PractitionerDetailsDTO
  | SupervisorDetailsDTO
  | AdminDetailsDTO;

export interface UpdatePatientDetailsRequestDTO {
  healthInsurance?: string | null;
  bloodType?: BloodType | null;
}

export interface UpdateSupervisorDetailsRequestDTO {
  specialty?: string;
}
