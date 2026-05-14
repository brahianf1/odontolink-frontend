import apiClient from './apiClient';
import type {
  OfferedTreatmentResponseDTO,
  AddOfferedTreatmentRequestDTO,
  UpdateOfferedTreatmentRequestDTO,
  TreatmentResponseDTO,
} from '../../types/practitioner.types';
import type {
  AppointmentResponseDTO,
  AttentionResponseDTO,
  ProgressNoteResponseDTO,
  ProgressNoteRequestDTO,
} from '../../types/attention.types';

// ============= Offered Treatments =============
export const getMyOfferedTreatments = async (): Promise<OfferedTreatmentResponseDTO[]> => {
  const response = await apiClient.get<OfferedTreatmentResponseDTO[]>(
    '/api/practitioner/offered-treatments'
  );
  return response.data;
};

export const addTreatmentToCatalog = async (
  data: AddOfferedTreatmentRequestDTO
): Promise<OfferedTreatmentResponseDTO> => {
  const response = await apiClient.post<OfferedTreatmentResponseDTO>(
    '/api/practitioner/offered-treatments',
    data
  );
  return response.data;
};

export const updateOfferedTreatment = async (
  id: number,
  data: UpdateOfferedTreatmentRequestDTO
): Promise<OfferedTreatmentResponseDTO> => {
  const response = await apiClient.put<OfferedTreatmentResponseDTO>(
    `/api/practitioner/offered-treatments/${id}`,
    data
  );
  return response.data;
};

export const removeFromCatalog = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/practitioner/offered-treatments/${id}`);
};

// ============= Appointments =============
export const getMyUpcomingAppointments = async (): Promise<AppointmentResponseDTO[]> => {
  const response = await apiClient.get<AppointmentResponseDTO[]>(
    '/api/practitioner/appointments/upcoming'
  );
  return response.data;
};

export const markAppointmentAsCompleted = async (
  appointmentId: number
): Promise<AppointmentResponseDTO> => {
  const response = await apiClient.post<AppointmentResponseDTO>(
    `/api/practitioner/appointments/${appointmentId}/complete`
  );
  return response.data;
};

export const markAppointmentAsNoShow = async (
  appointmentId: number
): Promise<AppointmentResponseDTO> => {
  const response = await apiClient.post<AppointmentResponseDTO>(
    `/api/practitioner/appointments/${appointmentId}/no-show`
  );
  return response.data;
};

export interface CancelAppointmentRequestDTO {
  motive: string;
}

export const cancelAppointment = async (
  appointmentId: number,
  data: CancelAppointmentRequestDTO
): Promise<AppointmentResponseDTO> => {
  const response = await apiClient.post<AppointmentResponseDTO>(
    `/api/practitioner/appointments/${appointmentId}/cancel`,
    data
  );
  return response.data;
};

// ============= Attentions =============
export const getMyAttentions = async (): Promise<AttentionResponseDTO[]> => {
  const response = await apiClient.get<AttentionResponseDTO[]>('/api/practitioner/attentions');
  return response.data;
};

export const getAttentionById = async (attentionId: number): Promise<AttentionResponseDTO> => {
  const response = await apiClient.get<AttentionResponseDTO>(`/api/attentions/${attentionId}`);
  return response.data;
};

export const addProgressNote = async (
  attentionId: number,
  data: ProgressNoteRequestDTO
): Promise<AttentionResponseDTO> => {
  const response = await apiClient.post<AttentionResponseDTO>(
    `/api/attentions/${attentionId}/progress-notes`,
    data
  );
  return response.data;
};

export const getProgressNotes = async (
  attentionId: number
): Promise<ProgressNoteResponseDTO[]> => {
  const response = await apiClient.get<ProgressNoteResponseDTO[]>(
    `/api/attentions/${attentionId}/progress-notes`
  );
  return response.data;
};

export const finalizeAttention = async (attentionId: number): Promise<AttentionResponseDTO> => {
  const response = await apiClient.post<AttentionResponseDTO>(
    `/api/attentions/${attentionId}/finalize`
  );
  return response.data;
};

// ============= Treatments (General Catalog) =============
export const getAllTreatments = async (): Promise<TreatmentResponseDTO[]> => {
  const response = await apiClient.get<TreatmentResponseDTO[]>('/api/treatments');
  return response.data;
};

export const getTreatmentById = async (id: number): Promise<TreatmentResponseDTO> => {
  const response = await apiClient.get<TreatmentResponseDTO>(`/api/treatments/${id}`);
  return response.data;
};
