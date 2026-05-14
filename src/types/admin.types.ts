export type AdminUserRole =
  | 'ROLE_PATIENT'
  | 'ROLE_PRACTITIONER'
  | 'ROLE_SUPERVISOR'
  | 'ROLE_ADMIN';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ADMIN_USER_ROLES: AdminUserRole[] = [
  'ROLE_PATIENT',
  'ROLE_PRACTITIONER',
  'ROLE_SUPERVISOR',
  'ROLE_ADMIN',
];

export interface AdminUserDTO {
  id: number;
  email: string;
  role: AdminUserRole | string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  createdAt: string;
  active: boolean;
}

export interface AdminUsersQuery {
  role?: AdminUserRole;
  isActive?: boolean;
  query?: string;
}

export interface UpdateUserProfileRequestDTO {
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
}

export interface AdminCreatePractitionerRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  studentId: string;
  studyYear: number;
}

export interface AdminCreatePatientRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  healthInsurance?: string;
  bloodType?: BloodType;
}

export interface AdminCreateSupervisorRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  specialty: string;
  employeeId: string;
}

export interface InstitutionalSettingsResponseDTO {
  institutionName: string;
  openingHours?: string;
  usagePolicies?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  maxConcurrentAppointmentsPerAttention: number;
  updatedAt: string;
}

export interface UpdateInstitutionalSettingsRequestDTO {
  institutionName: string;
  openingHours?: string;
  usagePolicies?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  maxConcurrentAppointmentsPerAttention: number;
}

export type CreatableRole =
  | 'ROLE_PATIENT'
  | 'ROLE_PRACTITIONER'
  | 'ROLE_SUPERVISOR';
