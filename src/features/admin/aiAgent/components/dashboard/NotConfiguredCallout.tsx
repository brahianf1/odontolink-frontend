import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { SmartToy as SmartToyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotConfiguredCallout() {
  const navigate = useNavigate();
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 5 }}>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SmartToyIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            El agente IA todavía no fue configurado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
            Completá la configuración inicial para definir el comportamiento del chatbot, sus
            parámetros y la base de conocimiento.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/ai-agent/configuration')}
          >
            Configurar agente ahora
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
