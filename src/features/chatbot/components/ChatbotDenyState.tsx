import { Box, Button, Stack, Typography } from '@mui/material';
import {
  Login as LoginIcon,
  Build as MaintenanceIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { ChatbotDenyReason } from '../../../types/chatbot.types';

interface ChatbotDenyStateProps {
  reason: ChatbotDenyReason;
}

interface DenyCopy {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: { label: string; to: string };
}

const COPY: Record<ChatbotDenyReason, DenyCopy> = {
  AUTHENTICATION_REQUIRED: {
    icon: <LoginIcon sx={{ fontSize: 48 }} color="primary" />,
    title: 'Iniciá sesión para usar el asistente',
    description:
      'El asistente está disponible solo para usuarios autenticados. Iniciá sesión y volvé a abrir el chat.',
    cta: { label: 'Iniciar sesión', to: '/login' },
  },
  AGENT_DISABLED: {
    icon: <BlockIcon sx={{ fontSize: 48 }} color="disabled" />,
    title: 'Asistente desactivado',
    description: 'La administración desactivó el asistente. Volvé a intentarlo más tarde.',
  },
  AGENT_NOT_PUBLISHED: {
    icon: <MaintenanceIcon sx={{ fontSize: 48 }} color="warning" />,
    title: 'Asistente en mantenimiento',
    description:
      'El asistente está siendo actualizado. Volvé a intentarlo en unos minutos.',
  },
  ROLE_NOT_ALLOWED: {
    icon: <BlockIcon sx={{ fontSize: 48 }} color="disabled" />,
    title: 'Sin acceso al asistente',
    description: 'Tu rol no tiene acceso al asistente con la configuración actual.',
  },
};

export default function ChatbotDenyState({ reason }: ChatbotDenyStateProps) {
  const navigate = useNavigate();
  const copy = COPY[reason];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.5} alignItems="center" sx={{ maxWidth: 320 }}>
        {copy.icon}
        <Typography variant="subtitle1" fontWeight={700}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {copy.description}
        </Typography>
        {copy.cta && (
          <Button
            variant="contained"
            size="medium"
            startIcon={<LoginIcon />}
            onClick={() => navigate(copy.cta!.to)}
            sx={{ mt: 1 }}
          >
            {copy.cta.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
