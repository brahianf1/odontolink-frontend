import { Alert, AlertTitle, Box } from '@mui/material';
import { ReportProblem as EmergencyIcon } from '@mui/icons-material';

interface ChatbotEmergencyBannerProps {
  /**
   * Texto custom configurable por el admin. Si está vacío, se usa un copy
   * empático genérico. Hoy el backend no lo expone en el endpoint público
   * del chatbot, pero queda preparado para cuando se conecte.
   */
  customText?: string;
}

const DEFAULT_TEXT =
  'Si tu situación requiere atención inmediata, contactá la guardia odontológica de la facultad o un servicio de emergencias médicas. Este asistente no reemplaza la atención profesional.';

export default function ChatbotEmergencyBanner({
  customText,
}: ChatbotEmergencyBannerProps) {
  return (
    <Alert
      severity="error"
      icon={<EmergencyIcon fontSize="medium" />}
      variant="filled"
      sx={{
        mb: 0.75,
        py: 0.75,
        alignItems: 'flex-start',
        '& .MuiAlert-icon': { pt: 0.25, mr: 1 },
        '& .MuiAlert-message': { py: 0 },
      }}
    >
      <AlertTitle sx={{ mb: 0.25, fontWeight: 700, fontSize: '0.95rem' }}>
        Posible situación de urgencia
      </AlertTitle>
      <Box component="span" sx={{ display: 'block', fontSize: '0.825rem', lineHeight: 1.4 }}>
        {customText?.trim() || DEFAULT_TEXT}
      </Box>
    </Alert>
  );
}
