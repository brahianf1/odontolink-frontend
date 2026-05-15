import { useState } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Delete,
  Edit,
  EventRepeat,
  MoreVert,
  PauseCircleOutline,
  PlayCircleOutline,
  RestartAlt,
} from '@mui/icons-material';
import type { ReactElement } from 'react';
import type { OfferedTreatmentResponseDTO } from '../../../../types/practitioner.types';
import { DAY_LABELS, compareDays, type DayOfWeek } from '../../utils/dayOfWeek';
import { deriveDisplayStatus, type OfferDisplayStatus } from '../../utils/offerStatus';
import OfferStatusChip from './OfferStatusChip';
import TreatmentCard, { type TreatmentCardActions } from './TreatmentCard';

interface TreatmentListProps extends TreatmentCardActions {
  offers: OfferedTreatmentResponseDTO[];
  completedByTreatment: Map<number, number>;
  mutatingId?: number | null;
}

const formatDate = (s?: string) => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};

interface RowAction {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  destructive?: boolean;
}

const buildActions = (
  display: OfferDisplayStatus,
  offer: OfferedTreatmentResponseDTO,
  handlers: TreatmentCardActions
): RowAction[] => {
  const actions: RowAction[] = [];

  if (display === 'INACTIVE') {
    actions.push({
      label: 'Reactivar',
      icon: <RestartAlt fontSize="small" />,
      onClick: () => handlers.onReactivate(offer),
    });
  } else if (display === 'PAUSED') {
    actions.push({
      label: 'Reanudar',
      icon: <PlayCircleOutline fontSize="small" />,
      onClick: () => handlers.onResume(offer),
    });
  } else if (display === 'EXPIRED') {
    actions.push({
      label: 'Renovar fechas',
      icon: <EventRepeat fontSize="small" />,
      onClick: () => handlers.onRenewDates(offer),
    });
    actions.push({
      label: 'Pausar',
      icon: <PauseCircleOutline fontSize="small" />,
      onClick: () => handlers.onPause(offer),
    });
  } else {
    // ACTIVE / SCHEDULED / QUOTA_FULL
    actions.push({
      label: 'Editar',
      icon: <Edit fontSize="small" />,
      onClick: () => handlers.onEdit(offer),
    });
    actions.push({
      label: 'Pausar',
      icon: <PauseCircleOutline fontSize="small" />,
      onClick: () => handlers.onPause(offer),
    });
  }

  actions.push({
    label: display === 'INACTIVE' ? 'Eliminar definitivamente' : 'Eliminar del catálogo',
    icon: <Delete fontSize="small" />,
    onClick: () => handlers.onDelete(offer),
    destructive: true,
  });

  return actions;
};

/**
 * Material 3 data-table layout. Each row is a self-contained record with a
 * compact actions menu. Mobile (<md) falls back to the card view because a
 * 6-column table doesn't fit comfortably on a phone.
 */
export default function TreatmentList({
  offers,
  completedByTreatment,
  mutatingId,
  ...handlers
}: TreatmentListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {offers.map((offer) => (
          <TreatmentCard
            key={offer.id}
            treatment={offer}
            completedPatientsCount={completedByTreatment.get(offer.treatment.id)}
            busy={mutatingId === offer.id}
            {...handlers}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <Table
        size="medium"
        sx={{
          '& th': {
            fontWeight: 700,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Tratamiento</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Vigencia</TableCell>
            <TableCell align="center">Duración</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Cupo</TableCell>
            <TableCell>Días</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.map((offer) => {
            const display = deriveDisplayStatus(offer);
            const completed =
              completedByTreatment.get(offer.treatment.id) ??
              offer.currentCompletedAttentions ??
              0;
            const max = offer.maxCompletedAttentions ?? 0;
            const pct = max > 0 ? Math.min((completed / max) * 100, 100) : 0;
            const isArchived = display === 'INACTIVE';
            const days = Array.from(new Set(offer.availabilitySlots.map((s) => s.dayOfWeek)))
              .sort((a, b) => compareDays(a as DayOfWeek, b as DayOfWeek))
              .map((d) => DAY_LABELS[d as DayOfWeek].substring(0, 3))
              .join(' · ');
            const actions = buildActions(display, offer, handlers);

            return (
              <TableRow
                key={offer.id}
                hover
                sx={{
                  opacity: isArchived ? 0.7 : 1,
                  '&:last-child td': { border: 0 },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {offer.treatment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {offer.treatment.area}
                  </Typography>
                </TableCell>
                <TableCell>
                  <OfferStatusChip status={display} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(offer.offerStartDate)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    hasta {formatDate(offer.offerEndDate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={500}>
                    {offer.durationInMinutes} min
                  </Typography>
                </TableCell>
                <TableCell>
                  {max > 0 ? (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>
                          {completed} / {max}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(pct)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        color={display === 'QUOTA_FULL' ? 'info' : 'primary'}
                        sx={{ height: 4, borderRadius: 999 }}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {days || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <RowActionsMenu actions={actions} busy={mutatingId === offer.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function RowActionsMenu({ actions, busy }: { actions: RowAction[]; busy?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  return (
    <>
      <Tooltip title="Acciones">
        <span>
          <IconButton
            size="small"
            onClick={(e) => setAnchor(e.currentTarget)}
            disabled={busy}
            aria-label="Acciones"
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((a) => (
          <MenuItem
            key={a.label}
            onClick={() => {
              setAnchor(null);
              a.onClick();
            }}
            sx={{ color: a.destructive ? 'error.main' : 'text.primary', gap: 1.5 }}
          >
            <Box sx={{ display: 'flex' }}>{a.icon}</Box>
            {a.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
