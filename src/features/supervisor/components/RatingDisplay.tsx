import { Box, Rating, Typography } from '@mui/material';

interface RatingDisplayProps {
  value: number;
  showValue?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function RatingDisplay({
  value,
  showValue = true,
  size = 'small',
}: RatingDisplayProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Rating value={value} readOnly precision={0.1} size={size} />
      {showValue && (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
}
