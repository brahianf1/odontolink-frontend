import { useEffect, useLayoutEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { ChatbotMessage } from '../../../types/chatbot.types';
import ChatbotMessageBubble from './ChatbotMessageBubble';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';

interface ChatbotMessageListProps {
  messages: ChatbotMessage[];
  welcomeMessage?: string;
}

export default function ChatbotMessageList({
  messages,
  welcomeMessage,
}: ChatbotMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastCountRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length > lastCountRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    lastCountRef.current = messages.length;
  }, [messages]);

  const hasRealMessages = messages.some((m) => m.role !== 'system');

  return (
    <Box
      ref={scrollRef}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        py: 1.5,
        backgroundColor: 'background.default',
      }}
    >
      {welcomeMessage && !hasRealMessages && (
        <Box sx={{ px: 1, mb: 0.75 }}>
          <Box
            sx={{
              maxWidth: { xs: '90%', sm: '80%' },
              border: 1,
              borderColor: 'divider',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.background.paper
                  : theme.palette.grey[100],
              borderRadius: '16px 16px 16px 4px',
              px: 1.5,
              py: 1,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
              {welcomeMessage}
            </Typography>
          </Box>
        </Box>
      )}
      {messages.map((message) =>
        message.role === 'system' ? (
          <ChatbotTypingIndicator key={message.id} />
        ) : (
          <ChatbotMessageBubble key={message.id} message={message} />
        )
      )}
    </Box>
  );
}
