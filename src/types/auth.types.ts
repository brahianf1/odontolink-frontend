// Authentication Types based on OpenAPI specification

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface JwtResponseDTO {
  token: string;
  type: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface RegisterPatientRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  birthDate?: string;
  healthInsurance?: string;
  bloodType?: string;
}

export interface RegisterPractitionerRequestDTO {
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

export interface RegisterSupervisorRequestDTO {
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

export type UserRole = 'PATIENT' | 'PRACTITIONER' | 'SUPERVISOR' | 'ADMIN';
