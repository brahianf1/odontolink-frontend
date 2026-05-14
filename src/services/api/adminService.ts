import apiClient from './apiClient';
import type {
  AdminUserDTO,
  AdminUsersQuery,
  AdminCreatePatientRequestDTO,
  AdminCreatePractitionerRequestDTO,
  AdminCreateSupervisorRequestDTO,
  UpdateUserProfileRequestDTO,
  InstitutionalSettingsResponseDTO,
  UpdateInstitutionalSettingsRequestDTO,
} from '../../types/admin.types';

const ADMIN_BASE = '/api/admin';

export const listUsers = async (params: AdminUsersQuery = {}): Promise<AdminUserDTO[]> => {
  const response = await apiClient.get<AdminUserDTO[]>(`${ADMIN_BASE}/users`, {
    params: {
      role: params.role || undefined,
      isActive: typeof params.isActive === 'boolean' ? params.isActive : undefined,
      query: params.query?.trim() ? params.query.trim() : undefined,
    },
  });
  return response.data;
};

export const getUserById = async (id: number): Promise<AdminUserDTO> => {
  const response = await apiClient.get<AdminUserDTO>(`${ADMIN_BASE}/users/${id}`);
  return response.data;
};

export const updateUserProfile = async (
  id: number,
  data: UpdateUserProfileRequestDTO
): Promise<AdminUserDTO> => {
  const response = await apiClient.put<AdminUserDTO>(`${ADMIN_BASE}/users/${id}`, data);
  return response.data;
};

export const deactivateUser = async (id: number): Promise<AdminUserDTO> => {
  const response = await apiClient.delete<AdminUserDTO>(`${ADMIN_BASE}/users/${id}`);
  return response.data;
};

export const reactivateUser = async (id: number): Promise<AdminUserDTO> => {
  const response = await apiClient.post<AdminUserDTO>(`${ADMIN_BASE}/users/${id}/activate`);
  return response.data;
};

export const createPatient = async (
  data: AdminCreatePatientRequestDTO
): Promise<AdminUserDTO> => {
  const response = await apiClient.post<AdminUserDTO>(`${ADMIN_BASE}/users/patient`, data);
  return response.data;
};

export const createPractitioner = async (
  data: AdminCreatePractitionerRequestDTO
): Promise<AdminUserDTO> => {
  const response = await apiClient.post<AdminUserDTO>(`${ADMIN_BASE}/users/practitioner`, data);
  return response.data;
};

export const createSupervisor = async (
  data: AdminCreateSupervisorRequestDTO
): Promise<AdminUserDTO> => {
  const response = await apiClient.post<AdminUserDTO>(`${ADMIN_BASE}/users/supervisor`, data);
  return response.data;
};

export const getInstitutionalSettings = async (): Promise<InstitutionalSettingsResponseDTO> => {
  const response = await apiClient.get<InstitutionalSettingsResponseDTO>(`${ADMIN_BASE}/settings`);
  return response.data;
};

export const updateInstitutionalSettings = async (
  data: UpdateInstitutionalSettingsRequestDTO
): Promise<InstitutionalSettingsResponseDTO> => {
  const response = await apiClient.put<InstitutionalSettingsResponseDTO>(
    `${ADMIN_BASE}/settings`,
    data
  );
  return response.data;
};
