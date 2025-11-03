import apiClient from './apiClient';
import type {
  LoginRequestDTO,
  JwtResponseDTO,
  RegisterPatientRequestDTO,
  RegisterPractitionerRequestDTO,
  RegisterSupervisorRequestDTO,
} from '../../types/auth.types';

// Login endpoint
export const login = async (credentials: LoginRequestDTO): Promise<JwtResponseDTO> => {
  const response = await apiClient.post<JwtResponseDTO>('/api/auth/login', credentials);
  return response.data;
};

// Register Patient
export const registerPatient = async (data: RegisterPatientRequestDTO): Promise<void> => {
  await apiClient.post('/api/auth/register/patient', data);
};

// Register Practitioner
export const registerPractitioner = async (data: RegisterPractitionerRequestDTO): Promise<void> => {
  await apiClient.post('/api/auth/register/practitioner', data);
};

// Register Supervisor
export const registerSupervisor = async (data: RegisterSupervisorRequestDTO): Promise<void> => {
  await apiClient.post('/api/supervisors/register', data);
};
