import { useCallback, useEffect, useRef, useState } from 'react';
import { listUsers } from '../../../services/api/adminService';
import type {
  AdminUserDTO,
  AdminUserRole,
  AdminUsersQuery,
} from '../../../types/admin.types';
import type { StatusFilter } from '../components/UserFilters';

interface UseAdminUsersState {
  users: AdminUserDTO[];
  loading: boolean;
  error: string | null;
  search: string;
  role: AdminUserRole | '';
  status: StatusFilter;
  setSearch: (value: string) => void;
  setRole: (value: AdminUserRole | '') => void;
  setStatus: (value: StatusFilter) => void;
  refresh: () => Promise<void>;
  replaceUser: (user: AdminUserDTO) => void;
  prependUser: (user: AdminUserDTO) => void;
}

const SEARCH_DEBOUNCE_MS = 350;

const mapStatusToFlag = (status: StatusFilter): boolean | undefined => {
  if (status === 'active') return true;
  if (status === 'inactive') return false;
  return undefined;
};

export const useAdminUsers = (): UseAdminUsersState => {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<AdminUserRole | ''>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query: AdminUsersQuery = {
      role: role || undefined,
      isActive: mapStatusToFlag(status),
      query: debouncedSearch || undefined,
    };
    try {
      const data = await listUsers(query);
      if (isMounted.current) {
        setUsers(data);
      }
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message || 'Error al cargar los usuarios';
        setError(message);
        setUsers([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, role, status]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const refresh = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const replaceUser = useCallback((user: AdminUserDTO) => {
    setUsers((prev) => prev.map((item) => (item.id === user.id ? user : item)));
  }, []);

  const prependUser = useCallback((user: AdminUserDTO) => {
    setUsers((prev) => [user, ...prev]);
  }, []);

  return {
    users,
    loading,
    error,
    search,
    role,
    status,
    setSearch,
    setRole,
    setStatus,
    refresh,
    replaceUser,
    prependUser,
  };
};
