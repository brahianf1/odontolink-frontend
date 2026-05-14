import apiClient from './apiClient';
import type {
  CreateTreatmentRequestDTO,
  TreatmentResponseDTO,
} from '../../types/practitioner.types';

const TREATMENTS_BASE = '/api/treatments';

export const listMasterTreatments = async (): Promise<TreatmentResponseDTO[]> => {
  const response = await apiClient.get<TreatmentResponseDTO[]>(TREATMENTS_BASE);
  return response.data;
};

export const getMasterTreatmentById = async (
  id: number
): Promise<TreatmentResponseDTO> => {
  const response = await apiClient.get<TreatmentResponseDTO>(`${TREATMENTS_BASE}/${id}`);
  return response.data;
};

export const createMasterTreatment = async (
  data: CreateTreatmentRequestDTO
): Promise<TreatmentResponseDTO> => {
  const response = await apiClient.post<TreatmentResponseDTO>(TREATMENTS_BASE, data);
  return response.data;
};
