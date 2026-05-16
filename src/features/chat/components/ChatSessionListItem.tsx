import {
  Avatar,
  Badge,
  Box,
  ListItemButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import type {
  ChatSessionResponseDTO,
  ChatViewerRole,
} from '../types/chat.types';
import { getCounterpart } from '../utils/chatViewModel';
import { formatSessionPreviewTime } from '../utils/chatTimeFormat';

interface ChatSessionListItemProps {
  session: ChatSessionResponseDTO;
  selected: boolean;
  viewerRole: ChatViewerRole;
  onClick: (session: ChatSessionResponseDTO) => void;
}

export default function ChatSessionListItem({
  session,
  selected,
  viewerRole,
  onClick,
}: ChatSessionListItemProps) {
  const theme = useTheme();
  const counterpart = getCounterpart(session, viewerRole);
  const preview =
    session.lastMessagePreview?.trim() || 'Sin mensajes todavía';
  const time = formatSessionPreviewTime(session.lastMessageAt);
  const hasUnread = session.unreadCount > 0;

  return (
    <ListItemButton
      onClick={() => onClick(session)}
      selected={selected}
      sx={{
        py: 1.25,
        px: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        alignItems: 'flex-start',
        gap: 1.5,
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },
        },
      }}
    >
      <Badge
        invisible={!session.blocked}
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <BlockIcon
            sx={{
              fontSize: 12,
              color: theme.palette.background.paper,
            }}
          />
        }
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: theme.palette.error.main,
            width: 18,
            height: 18,
            minWidth: 18,
            borderRadius: '50%',
            border: `2px solid ${theme.palette.background.paper}`,
            padding: 0,
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 42,
            height: 42,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {counterpart.initials}
        </Avatar>
      </Badge>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: hasUnread ? 700 : 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {counterpart.name}
          </Typography>
          {time && (
            <Typography
              variant="caption"
              sx={{
                color: hasUnread ? 'primary.main' : 'text.secondary',
                fontWeight: hasUnread ? 700 : 400,
                flexShrink: 0,
              }}
            >
              {time}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mt: 0.25,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: hasUnread ? 'text.primary' : 'text.secondary',
              fontWeight: hasUnread ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
              fontSize: '0.85rem',
            }}
          >
            {preview}
          </Typography>
          {hasUnread && (
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                minWidth: 22,
                height: 22,
                px: 0.75,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label={`${session.unreadCount} mensajes sin leer`}
            >
              {session.unreadCount > 99 ? '99+' : session.unreadCount}
            </Box>
          )}
        </Box>
      </Box>
    </ListItemButton>
  );
}
