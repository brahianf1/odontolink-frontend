import { Alert } from '@mui/material';
import { ReportProblem as EmergencyIcon } from '@mui/icons-material';

export default function ChatbotEmergencyBanner() {
  return (
    <Alert
      severity="error"
      icon={<EmergencyIcon fontSize="inherit" />}
      variant="filled"
      sx={{ mb: 0.5, py: 0.5 }}
    >
      Situación de emergencia detectada
    </Alert>
  );
}
