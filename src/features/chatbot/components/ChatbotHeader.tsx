import { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  MoreVert as MoreIcon,
  RestartAlt as RestartIcon,
  SupportAgent as AgentIcon,
} from '@mui/icons-material';

interface ChatbotHeaderProps {
  displayName?: string;
  onClose: () => void;
  onNewConversation?: () => void;
  newConversationDisabled?: boolean;
}

export default function ChatbotHeader({
  displayName,
  onClose,
  onNewConversation,
  newConversationDisabled,
}: ChatbotHeaderProps) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleNewConversation = () => {
    setMenuAnchor(null);
    onNewConversation?.();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        minHeight: 56,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <AgentIcon fontSize="small" />
      </Avatar>
      <Stack direction="column" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          noWrap
          sx={{ lineHeight: 1.2 }}
        >
          {displayName ?? 'Asistente'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          Asistente virtual
        </Typography>
      </Stack>
      {onNewConversation && (
        <>
          <Tooltip title="Más opciones" arrow>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="Más opciones"
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={menuAnchor !== null}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={handleNewConversation}
              disabled={newConversationDisabled}
            >
              <ListItemIcon>
                <RestartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Nueva conversación</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
      <Tooltip title="Cerrar" arrow>
        <IconButton size="small" onClick={onClose} aria-label="Cerrar asistente">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
