import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import {
  CHAT_MESSAGE_MAX_LENGTH,
  validateChatMessage,
} from '../utils/chatValidation';

interface ChatComposerProps {
  disabled?: boolean;
  disabledReason?: string;
  onSend: (content: string) => Promise<void> | void;
  sessionId: number | null;
}

export default function ChatComposer({
  disabled = false,
  disabledReason,
  onSend,
  sessionId,
}: ChatComposerProps) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValue('');
  }, [sessionId]);

  const validation = validateChatMessage(value);
  const overLimit = value.length > CHAT_MESSAGE_MAX_LENGTH;
  const canSubmit =
    !disabled && !submitting && validation.valid && sessionId != null;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const content = validation.sanitized;
    setSubmitting(true);
    try {
      await onSend(content);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, onSend, validation.sanitized]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        px: 2,
        py: 1.25,
      }}
    >
      {disabled && disabledReason && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.75 }}
        >
          {disabledReason}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          placeholder={
            disabled
              ? 'No puedes escribir en esta conversación.'
              : 'Escribe un mensaje…'
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || submitting}
          inputProps={{
            'aria-label': 'Nuevo mensaje',
            maxLength: CHAT_MESSAGE_MAX_LENGTH + 50,
          }}
        />
        <Tooltip
          title={
            disabled
              ? 'No disponible'
              : overLimit
              ? 'El mensaje supera el límite'
              : 'Enviar (Enter)'
          }
        >
          <span>
            <IconButton
              onClick={handleSubmit}
              disabled={!canSubmit}
              color="primary"
              sx={{
                backgroundColor: canSubmit ? 'primary.main' : 'transparent',
                color: canSubmit ? 'primary.contrastText' : 'text.disabled',
                '&:hover': {
                  backgroundColor: canSubmit
                    ? 'primary.dark'
                    : 'transparent',
                },
                width: 44,
                height: 44,
              }}
              aria-label="Enviar mensaje"
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 0.5,
          px: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Enter para enviar · Shift+Enter para nueva línea
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: overLimit ? 'error.main' : 'text.secondary',
            fontWeight: overLimit ? 700 : 400,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value.length} / {CHAT_MESSAGE_MAX_LENGTH}
        </Typography>
      </Box>
    </Box>
  );
}
