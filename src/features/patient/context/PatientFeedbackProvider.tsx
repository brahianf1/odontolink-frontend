import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface SnackbarMessage {
  id: number;
  severity: AlertColor;
  message: string;
}

interface PatientFeedbackContextValue {
  notify: (message: string, severity?: AlertColor) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyWarning: (message: string) => void;
  notifyInfo: (message: string) => void;
}

const PatientFeedbackContext = createContext<PatientFeedbackContextValue | null>(null);

interface PatientFeedbackProviderProps {
  children: ReactNode;
}

export function PatientFeedbackProvider({ children }: PatientFeedbackProviderProps) {
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);
  const idRef = useRef(0);

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    idRef.current += 1;
    setCurrent({ id: idRef.current, severity, message });
  }, []);

  const handleClose = useCallback((_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setCurrent(null);
  }, []);

  const value = useMemo<PatientFeedbackContextValue>(
    () => ({
      notify,
      notifySuccess: (m: string) => notify(m, 'success'),
      notifyError: (m: string) => notify(m, 'error'),
      notifyWarning: (m: string) => notify(m, 'warning'),
      notifyInfo: (m: string) => notify(m, 'info'),
    }),
    [notify]
  );

  return (
    <PatientFeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {current ? (
          <Alert
            severity={current.severity}
            onClose={() => setCurrent(null)}
            variant="filled"
            sx={{ width: '100%', boxShadow: 6 }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PatientFeedbackContext.Provider>
  );
}

export function usePatientFeedback(): PatientFeedbackContextValue {
  const ctx = useContext(PatientFeedbackContext);
  if (!ctx) {
    throw new Error('usePatientFeedback must be used within a PatientFeedbackProvider');
  }
  return ctx;
}
