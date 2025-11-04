import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { getMyChatSessions, getMessages, sendMessage } from '../../services/api/feedbackService';
import type { ChatSessionResponseDTO, ChatMessageResponseDTO, SendMessageRequestDTO } from '../../types/feedback.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';

export default function PatientChatPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionResponseDTO[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionResponseDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponseDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getMyChatSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session: ChatSessionResponseDTO) => {
    setSelectedSession(session);
    try {
      const msgs = await getMessages(session.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Error al cargar los mensajes');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;

    try {
      setSending(true);
      const messageData: SendMessageRequestDTO = { content: newMessage.trim() };
      await sendMessage(selectedSession.id, messageData);
      setNewMessage('');
      const msgs = await getMessages(selectedSession.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Chat con Practicantes
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Mensajería interna con tus practicantes asignados
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ height: '70vh', display: 'flex', overflow: 'hidden' }}>
        {/* Sessions List */}
        <Box
          sx={{
            width: { xs: '100%', md: '320px' },
            borderRight: { md: 1 },
            borderColor: 'divider',
            overflowY: 'auto',
            display: { xs: selectedSession ? 'none' : 'block', md: 'block' },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              Conversaciones
            </Typography>
          </Box>
          {sessions.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No tienes conversaciones activas.
            </Alert>
          ) : (
            <List>
              {sessions.map((session) => (
                <ListItemButton
                  key={session.id}
                  selected={selectedSession?.id === session.id}
                  onClick={() => handleSelectSession(session)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{session.practitionerName[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={session.practitionerName}
                    secondary={format(parseISO(session.createdAt), "d 'de' MMMM", { locale: es })}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: selectedSession ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
          }}
        >
          {!selectedSession ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <Typography>Selecciona una conversación para comenzar</Typography>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>{selectedSession.practitionerName[0]}</Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedSession.practitionerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Practicante
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.length === 0 ? (
                  <Alert severity="info">No hay mensajes aún. ¡Comienza la conversación!</Alert>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.senderId === user?.userId;
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: isMyMessage ? 'primary.main' : 'background.paper',
                            color: isMyMessage ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold" display="block">
                            {message.senderName}
                          </Typography>
                          <Typography variant="body2">{message.content}</Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                            {format(parseISO(message.sentAt), "HH:mm - d 'de' MMMM", { locale: es })}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })
                )}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Escribe tu mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={3}
                  disabled={sending}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  startIcon={<Send />}
                >
                  Enviar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
