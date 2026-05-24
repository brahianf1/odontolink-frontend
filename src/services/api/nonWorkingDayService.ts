import apiClient from './apiClient';
import type { NonWorkingDayDTO } from '../../types/nonWorkingDay.types';

const nonWorkingDayService = {
  getByYear: async (year: number): Promise<NonWorkingDayDTO[]> => {
    const response = await apiClient.get<NonWorkingDayDTO[]>('/api/non-working-days', {
      params: { year },
    });
    return response.data;
  },
};

export default nonWorkingDayService;
