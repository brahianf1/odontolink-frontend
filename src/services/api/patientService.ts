import apiClient from './apiClient';
import type {
  AppointmentResponseDTO,
  AppointmentRequestDTO,
  CancelAppointmentByPatientRequestDTO,
} from '../../types/appointment.types';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';
import type { FeedbackResponseDTO, CreateFeedbackRequestDTO } from '../../types/feedback.types';
import type { PageResponse } from '../../types/common.types';
import type { SearchTreatmentsParams } from '../../types/patient.types';

const PATIENT_BASE = '/api/patient';

const buildSearchParams = (params: SearchTreatmentsParams = {}): Record<string, string | number> => {
  const query: Record<string, string | number> = {};
  if (params.keyword?.trim()) query.keyword = params.keyword.trim();
  if (params.specialty?.trim()) query.specialty = params.specialty.trim();
  if (params.availability) query.availability = params.availability;
  if (params.page !== undefined) query.page = params.page;
  if (params.size !== undefined) query.size = params.size;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortDirection) query.sortDirection = params.sortDirection;
  return query;
};

const patientService = {
  searchAvailableTreatments: async (
    params: SearchTreatmentsParams = {}
  ): Promise<PageResponse<OfferedTreatmentResponseDTO>> => {
    const response = await apiClient.get<PageResponse<OfferedTreatmentResponseDTO>>(
      `${PATIENT_BASE}/offered-treatments`,
      { params: buildSearchParams(params) }
    );
    return response.data;
  },

  getAvailableTreatments: async (): Promise<OfferedTreatmentResponseDTO[]> => {
    const response = await apiClient.get<PageResponse<OfferedTreatmentResponseDTO>>(
      `${PATIENT_BASE}/offered-treatments`
    );
    return response.data.content;
  },

  getAvailableSlots: async (offeredTreatmentId: number, date: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `${PATIENT_BASE}/offered-treatments/${offeredTreatmentId}/availability`,
      { params: { date } }
    );
    return response.data;
  },

  scheduleAppointment: async (request: AppointmentRequestDTO): Promise<AttentionResponseDTO> => {
    const response = await apiClient.post<AttentionResponseDTO>(
      `${PATIENT_BASE}/appointments`,
      request
    );
    return response.data;
  },

  getMyUpcomingAppointments: async (): Promise<AppointmentResponseDTO[]> => {
    const response = await apiClient.get<AppointmentResponseDTO[]>(
      `${PATIENT_BASE}/appointments/upcoming`
    );
    return response.data;
  },

  cancelAppointment: async (
    appointmentId: number,
    payload: CancelAppointmentByPatientRequestDTO = {}
  ): Promise<AppointmentResponseDTO> => {
    const response = await apiClient.post<AppointmentResponseDTO>(
      `${PATIENT_BASE}/appointments/${appointmentId}/cancel`,
      payload
    );
    return response.data;
  },

  getMyAttentions: async (): Promise<AttentionResponseDTO[]> => {
    const response = await apiClient.get<AttentionResponseDTO[]>(`${PATIENT_BASE}/attentions`);
    return response.data;
  },

  getFeedbackForAttention: async (attentionId: number): Promise<FeedbackResponseDTO[]> => {
    const response = await apiClient.get<FeedbackResponseDTO[]>(`/api/feedback/attention/${attentionId}`);
    return response.data;
  },

  getReceivedFeedback: async (): Promise<FeedbackResponseDTO[]> => {
    const response = await apiClient.get<FeedbackResponseDTO[]>(`${PATIENT_BASE}/feedback/received`);
    return response.data;
  },

  createFeedback: async (request: CreateFeedbackRequestDTO): Promise<FeedbackResponseDTO> => {
    const response = await apiClient.post<FeedbackResponseDTO>('/api/feedback', request);
    return response.data;
  },
};

export default patientService;
