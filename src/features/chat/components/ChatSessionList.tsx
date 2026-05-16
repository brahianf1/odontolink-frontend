import {
  Alert,
  Box,
  CircularProgress,
  List,
  Typography,
  useTheme,
} from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import type {
  ChatSessionResponseDTO,
  ChatViewerRole,
} from '../types/chat.types';
import ChatSessionListItem from './ChatSessionListItem';

interface ChatSessionListProps {
  sessions: ChatSessionResponseDTO[];
  selectedSessionId: number | null;
  viewerRole: ChatViewerRole;
  loading: boolean;
  error: string | null;
  onSelect: (session: ChatSessionResponseDTO) => void;
}

export default function ChatSessionList({
  sessions,
  selectedSessionId,
  viewerRole,
  loading,
  error,
  onSelect,
}: ChatSessionListProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Conversaciones
        </Typography>
        {!loading && (
          <Typography variant="caption" color="text.secondary">
            ({sessions.length})
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && sessions.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              py: 6,
              px: 3,
              textAlign: 'center',
            }}
          >
            <ChatBubbleOutline
              sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.6 }}
            />
            <Typography variant="body2" color="text.secondary">
              No tienes conversaciones aún.
            </Typography>
            {viewerRole === 'PATIENT' && (
              <Typography variant="caption" color="text.secondary">
                Reserva un turno con un practicante para iniciar una
                conversación.
              </Typography>
            )}
          </Box>
        )}

        {!loading && !error && sessions.length > 0 && (
          <List disablePadding>
            {sessions.map((s) => (
              <ChatSessionListItem
                key={s.id}
                session={s}
                selected={s.id === selectedSessionId}
                viewerRole={viewerRole}
                onClick={onSelect}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
