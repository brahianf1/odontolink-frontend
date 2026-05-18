import { Alert, Tooltip } from '@mui/material';
import { PrivacyTip as PrivacyIcon } from '@mui/icons-material';
import type { DetectedPiiType } from '../../../types/chatbot.types';
import { piiTypesToText } from '../utils/piiTypeLabels';

interface ChatbotPiiBannerProps {
  detectedTypes?: DetectedPiiType[];
}

export default function ChatbotPiiBanner({ detectedTypes }: ChatbotPiiBannerProps) {
  const list = detectedTypes && detectedTypes.length > 0 ? piiTypesToText(detectedTypes) : '';
  const tooltipTitle = list ? `Datos detectados: ${list}` : 'Datos personales detectados.';
  return (
    <Tooltip title={tooltipTitle} arrow>
      <Alert
        severity="warning"
        icon={<PrivacyIcon fontSize="inherit" />}
        variant="outlined"
        sx={{ mb: 0.5, py: 0.5 }}
      >
        Por seguridad, no compartas datos personales.
      </Alert>
    </Tooltip>
  );
}
