import { Alert, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAiAgentContext } from './AiAgentContext';

const CONFIG_PATH = '/admin/ai-agent/configuration';

export default function UnconfiguredBanner() {
  const { isUnconfigured, configurationLoading } = useAiAgentContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (configurationLoading || !isUnconfigured) return null;
  if (location.pathname.startsWith(CONFIG_PATH)) return null;

  return (
    <Alert
      severity="info"
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={() => navigate(CONFIG_PATH)}>
          Configurar agente
        </Button>
      }
    >
      El agente IA todavía no fue configurado. Algunas acciones (subida de documentos, publicación)
      no estarán disponibles hasta que completes la configuración inicial.
    </Alert>
  );
}
