/**
 * Spring Boot–style paginated response envelope.
 * Mirrors the shape returned by `Page<T>` on the backend.
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
