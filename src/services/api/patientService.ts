import apiClient from './apiClient';
import type { AppointmentResponseDTO } from '../../types/appointment.types';
import type { AttentionResponseDTO } from '../../types/attention.types';
import type { OfferedTreatmentResponseDTO } from '../../types/practitioner.types';
import type { FeedbackResponseDTO, CreateFeedbackRequestDTO } from '../../types/feedback.types';
import type { AppointmentBookingRequest } from '../../types/patient.types';

const patientService = {
  // Get available treatments catalog (RF08, RF09)
  getAvailableTreatments: async (treatmentId?: number): Promise<OfferedTreatmentResponseDTO[]> => {
    const params = treatmentId ? { treatmentId } : {};
    const response = await apiClient.get<OfferedTreatmentResponseDTO[]>('/api/patient/offered-treatments', { params });
    return response.data;
  },

  // Get available time slots for a treatment (RF10)
  getAvailableSlots: async (offeredTreatmentId: number, date: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(
      `/api/patient/offered-treatments/${offeredTreatmentId}/availability`,
      { params: { date } }
    );
    return response.data;
  },

  // Schedule an appointment (RF10)
  scheduleAppointment: async (request: AppointmentBookingRequest): Promise<AppointmentResponseDTO> => {
    const response = await apiClient.post<AppointmentResponseDTO>('/api/patient/appointments', request);
    return response.data;
  },

  // Get upcoming appointments (RF15)
  getMyUpcomingAppointments: async (): Promise<AppointmentResponseDTO[]> => {
    const response = await apiClient.get<AppointmentResponseDTO[]>('/api/patient/appointments/upcoming');
    return response.data;
  },

  // Get my attentions as patient
  getMyAttentions: async (): Promise<AttentionResponseDTO[]> => {
    const response = await apiClient.get<AttentionResponseDTO[]>('/api/patient/attentions');
    return response.data;
  },

  // Get feedback for a specific attention
  getFeedbackForAttention: async (attentionId: number): Promise<FeedbackResponseDTO> => {
    const response = await apiClient.get<FeedbackResponseDTO>(`/api/feedback/attention/${attentionId}`);
    return response.data;
  },

  // Create feedback for practitioner (RF22)
  createFeedback: async (request: CreateFeedbackRequestDTO): Promise<FeedbackResponseDTO> => {
    const response = await apiClient.post<FeedbackResponseDTO>('/api/feedback', request);
    return response.data;
  },
};

export default patientService;
