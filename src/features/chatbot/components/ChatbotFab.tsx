import { Fab, Tooltip, Zoom, useTheme } from '@mui/material';
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
    <Zoom in appear timeout={300}>
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
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              duration: 200,
            }),
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
