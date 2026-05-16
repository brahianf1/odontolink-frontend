import { Box, Button } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

interface NewMessagePillProps {
  visible: boolean;
  count?: number;
  onClick: () => void;
}

export default function NewMessagePill({
  visible,
  count,
  onClick,
}: NewMessagePillProps) {
  if (!visible) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
      }}
    >
      <Button
        size="small"
        variant="contained"
        color="primary"
        startIcon={<KeyboardArrowDown />}
        onClick={onClick}
        sx={{ boxShadow: 2 }}
      >
        {count && count > 1
          ? `${count} mensajes nuevos`
          : 'Nuevo mensaje'}
      </Button>
    </Box>
  );
}
