import { Alert, Snackbar, type AlertColor } from '@mui/material';

interface ChatbotErrorSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

export default function ChatbotErrorSnackbar({
  open,
  message,
  severity = 'error',
  onClose,
}: ChatbotErrorSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ position: 'absolute' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
