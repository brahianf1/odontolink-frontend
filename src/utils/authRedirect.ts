export const getDashboardPathForRole = (role: string): string => {
  const normalized = role.replace('ROLE_', '').toUpperCase();
  switch (normalized) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'PRACTITIONER':
      return '/practitioner/dashboard';
    case 'PATIENT':
      return '/patient/dashboard';
    case 'SUPERVISOR':
      return '/supervisor/dashboard';
    default:
      return '/';
  }
};
