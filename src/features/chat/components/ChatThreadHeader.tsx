import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Block as BlockIcon,
  MoreVert,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import type { ChatCounterpart } from '../utils/chatViewModel';

interface ChatThreadHeaderProps {
  counterpart: ChatCounterpart;
  showBackButton: boolean;
  blocked: boolean;
  canBlock: boolean;
  blockedByViewer: boolean;
  onBack?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
}

export default function ChatThreadHeader({
  counterpart,
  showBackButton,
  blocked,
  canBlock,
  blockedByViewer,
  onBack,
  onBlock,
  onUnblock,
}: ChatThreadHeaderProps) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const closeMenu = () => setAnchor(null);

  const showMenu = canBlock && (blockedByViewer || !blocked);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {showBackButton && (
        <Tooltip title="Volver">
          <IconButton
            edge="start"
            size="small"
            onClick={onBack}
            aria-label="Volver a la lista"
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
      )}

      <Avatar
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          width: 40,
          height: 40,
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        {counterpart.initials}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {counterpart.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {counterpart.roleLabel}
          {blocked ? ' · Conversación bloqueada' : ''}
        </Typography>
      </Box>

      {showMenu && (
        <>
          <Tooltip title="Más opciones">
            <IconButton
              size="small"
              onClick={(e) => setAnchor(e.currentTarget)}
              aria-label="Más opciones"
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={closeMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {!blocked && (
              <MenuItem
                onClick={() => {
                  closeMenu();
                  onBlock?.();
                }}
                sx={{ color: 'error.main' }}
              >
                <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                Bloquear conversación
              </MenuItem>
            )}
            {blocked && blockedByViewer && (
              <MenuItem
                onClick={() => {
                  closeMenu();
                  onUnblock?.();
                }}
              >
                <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
                Desbloquear conversación
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </Box>
  );
}
