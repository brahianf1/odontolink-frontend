import { Fab, Tooltip, useTheme } from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ChatbotFabProps {
  open: boolean;
  displayName?: string;
  onClick: () => void;
}

export default function ChatbotFab({ open, displayName, onClick }: ChatbotFabProps) {
  const theme = useTheme();
  const tooltipTitle = open
    ? 'Cerrar asistente'
    : displayName
      ? `Abrir ${displayName}`
      : 'Abrir asistente';

  return (
    <Tooltip title={tooltipTitle} placement="left" arrow>
      <Fab
        color="primary"
        aria-label={tooltipTitle}
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: theme.zIndex.modal - 1,
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Tooltip>
  );
}
