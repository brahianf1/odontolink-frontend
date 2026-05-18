import { useCallback, useState } from 'react';
import { Box, IconButton, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const MAX_LENGTH = 2000;

interface ChatbotComposerProps {
  disabled?: boolean;
  disabledReason?: string;
  onSend: (text: string) => Promise<void> | void;
}

export default function ChatbotComposer({
  disabled = false,
  disabledReason,
  onSend,
}: ChatbotComposerProps) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmedLength = value.trim().length;
  const overLimit = value.length > MAX_LENGTH;
  const canSubmit = !disabled && !submitting && trimmedLength > 0 && !overLimit;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const toSend = value;
    setSubmitting(true);
    try {
      await onSend(toSend);
      setValue('');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, onSend, value]);

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
        px: 1.5,
        py: 1,
      }}
    >
      {disabled && disabledReason && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.5 }}
        >
          {disabledReason}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          size="small"
          placeholder={disabled ? 'No disponible' : 'Escribí tu consulta…'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || submitting}
          inputProps={{
            'aria-label': 'Mensaje al asistente',
            maxLength: MAX_LENGTH + 100,
          }}
        />
        <Tooltip
          title={
            disabled
              ? 'No disponible'
              : overLimit
                ? 'Mensaje demasiado largo'
                : trimmedLength === 0
                  ? 'Escribí un mensaje'
                  : 'Enviar (Enter)'
          }
          arrow
        >
          <span>
            <IconButton
              color="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Enviar mensaje"
              sx={{
                backgroundColor: canSubmit ? 'primary.main' : 'transparent',
                color: canSubmit ? 'primary.contrastText' : 'text.disabled',
                '&:hover': {
                  backgroundColor: canSubmit ? 'primary.dark' : 'transparent',
                },
                width: 40,
                height: 40,
              }}
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
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Enter para enviar · Shift+Enter nueva línea
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: overLimit ? 'error.main' : 'text.secondary',
            fontWeight: overLimit ? 700 : 400,
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.7rem',
          }}
        >
          {value.length} / {MAX_LENGTH}
        </Typography>
      </Box>
    </Box>
  );
}
