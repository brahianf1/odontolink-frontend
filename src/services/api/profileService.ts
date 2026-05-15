import apiClient from './apiClient';
import type { JwtResponseDTO } from '../../types/auth.types';
import type {
  ChangeMyPasswordRequestDTO,
  ForgotPasswordRequestDTO,
  MyDetailsDTO,
  MyProfileDTO,
  ProfilePictureResponseDTO,
  ResetPasswordRequestDTO,
  UpdateMyProfileRequestDTO,
  UpdatePatientDetailsRequestDTO,
  UpdateSupervisorDetailsRequestDTO,
} from '../../types/profile.types';

export const getMyProfile = async (): Promise<MyProfileDTO> => {
  const response = await apiClient.get<MyProfileDTO>('/api/users/me');
  return response.data;
};

export const updateMyProfile = async (
  data: UpdateMyProfileRequestDTO
): Promise<MyProfileDTO> => {
  const response = await apiClient.patch<MyProfileDTO>('/api/users/me', data);
  return response.data;
};

export const changeMyPassword = async (
  data: ChangeMyPasswordRequestDTO
): Promise<JwtResponseDTO> => {
  const response = await apiClient.put<JwtResponseDTO>(
    '/api/users/me/password',
    data
  );
  return response.data;
};

export const getMyDetails = async (): Promise<MyDetailsDTO> => {
  const response = await apiClient.get<MyDetailsDTO>('/api/users/me/details');
  return response.data;
};

export const updatePatientDetails = async (
  data: UpdatePatientDetailsRequestDTO
): Promise<void> => {
  await apiClient.patch('/api/users/me/details/patient', data);
};

export const updateSupervisorDetails = async (
  data: UpdateSupervisorDetailsRequestDTO
): Promise<void> => {
  await apiClient.patch('/api/users/me/details/supervisor', data);
};

export const uploadProfilePicture = async (
  file: File
): Promise<ProfilePictureResponseDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<ProfilePictureResponseDTO>(
    '/api/users/me/profile-picture',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const deleteProfilePicture = async (): Promise<void> => {
  await apiClient.delete('/api/users/me/profile-picture');
};

export const logoutAllSessions = async (): Promise<void> => {
  await apiClient.post('/api/users/me/logout-all');
};

export const forgotPassword = async (
  data: ForgotPasswordRequestDTO
): Promise<void> => {
  await apiClient.post('/api/auth/forgot-password', data);
};

export const resetPassword = async (
  data: ResetPasswordRequestDTO
): Promise<void> => {
  await apiClient.post('/api/auth/reset-password', data);
};
