import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { getMyChatSessions, getMessages, sendMessage } from '../../services/api/feedbackService';
import type { ChatSessionResponseDTO, ChatMessageResponseDTO, SendMessageRequestDTO } from '../../types/feedback.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';

export default function ChatPage() {
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
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Chat con Pacientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Mensajería interna con tus pacientes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)' }}>
        {/* Sessions List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 0, height: '100%', overflow: 'auto' }}>
              {sessions.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No tienes conversaciones aún
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sessions.map((session) => (
                    <ListItemButton
                      key={session.id}
                      selected={selectedSession?.id === session.id}
                      onClick={() => handleSelectSession(session)}
                    >
                      <ListItemAvatar>
                        <Avatar>{session.patientName.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={session.patientName}
                        secondary={format(parseISO(session.createdAt), 'dd/MM/yyyy', { locale: es })}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Messages */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
            {selectedSession ? (
              <>
                <CardContent sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedSession.patientName}
                  </Typography>
                </CardContent>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                      No hay mensajes aún
                    </Typography>
                  ) : (
                    messages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.senderId === user?.userId ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            bgcolor: msg.senderId === user?.userId ? 'primary.main' : 'grey.100',
                            color: msg.senderId === user?.userId ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                            {format(parseISO(msg.sentAt), 'HH:mm', { locale: es })}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  )}
                </Box>

                <Divider />

                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    endIcon={<Send />}
                  >
                    Enviar
                  </Button>
                </Box>
              </>
            ) : (
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Selecciona una conversación para ver los mensajes
                </Typography>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
