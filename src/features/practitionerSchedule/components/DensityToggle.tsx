import { useState } from 'react';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import CheckIcon from '@mui/icons-material/Check';
import { useScheduleDensityStore } from '../store/scheduleDensityStore';
import {
  DENSITY_LABELS,
  type ScheduleDensity,
} from '../types/schedule.types';

const DENSITY_ICON: Record<ScheduleDensity, React.ReactNode> = {
  compact: <DensitySmallIcon fontSize="small" />,
  comfortable: <DensityMediumIcon fontSize="small" />,
  spacious: <DensityLargeIcon fontSize="small" />,
};

const DENSITY_ORDER: ScheduleDensity[] = ['compact', 'comfortable', 'spacious'];

export default function DensityToggle() {
  const density = useScheduleDensityStore((s) => s.density);
  const setDensity = useScheduleDensityStore((s) => s.setDensity);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleSelect = (next: ScheduleDensity) => {
    setDensity(next);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Densidad de la agenda">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Cambiar densidad"
          aria-controls={open ? 'density-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
          }}
        >
          {DENSITY_ICON[density]}
        </IconButton>
      </Tooltip>
      <Menu
        id="density-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ dense: true }}
      >
        {DENSITY_ORDER.map((option) => (
          <MenuItem
            key={option}
            selected={option === density}
            onClick={() => handleSelect(option)}
          >
            <ListItemIcon>{DENSITY_ICON[option]}</ListItemIcon>
            <ListItemText primary={DENSITY_LABELS[option]} />
            {option === density && (
              <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
