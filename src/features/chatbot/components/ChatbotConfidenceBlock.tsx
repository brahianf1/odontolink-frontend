import { useId, useState, type MouseEvent, type ReactElement } from 'react';
import { Box, Chip, Popover, Typography } from '@mui/material';
import {
  CheckCircleOutline as OfficialIcon,
  InfoOutlined as PartialIcon,
  ChatBubbleOutline as GeneralIcon,
  HelpOutline as OutOfScopeIcon,
} from '@mui/icons-material';
import type { ChipProps } from '@mui/material';
import type { ConfidenceCategory } from '../../../types/chatbot.types';

interface ChatbotConfidenceBlockProps {
  category: ConfidenceCategory;
  label: string;
  message: string;
}

type CategoryStyle = {
  color: ChipProps['color'];
  icon: ReactElement;
};

const CATEGORY_STYLES: Record<ConfidenceCategory, CategoryStyle> = {
  OFFICIAL: { color: 'success', icon: <OfficialIcon sx={{ fontSize: 14 }} /> },
  PARTIAL: { color: 'info', icon: <PartialIcon sx={{ fontSize: 14 }} /> },
  GENERAL: { color: 'default', icon: <GeneralIcon sx={{ fontSize: 14 }} /> },
  OUT_OF_SCOPE: { color: 'warning', icon: <OutOfScopeIcon sx={{ fontSize: 14 }} /> },
};

export default function ChatbotConfidenceBlock({
  category,
  label,
  message,
}: ChatbotConfidenceBlockProps) {
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const { color, icon } = CATEGORY_STYLES[category];

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ mt: 0.5 }}>
      <Chip
        size="small"
        variant="outlined"
        color={color}
        icon={icon}
        label={label}
        onClick={handleOpen}
        clickable
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={`${label}. Tocá para ver el detalle.`}
      />
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              maxWidth: 320,
              mt: 0.5,
              p: 1.5,
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 0.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: color && color !== 'default' ? `${color}.main` : 'text.secondary',
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          {message}
        </Typography>
      </Popover>
    </Box>
  );
}
