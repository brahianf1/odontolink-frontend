import type { ReactElement } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  CalendarMonth,
  Delete,
  Edit,
  EventRepeat,
  MoreVert,
  PauseCircleOutline,
  PlayCircleOutline,
  RestartAlt,
  Schedule,
  Warning,
} from '@mui/icons-material';
import { useState } from 'react';
import type { OfferedTreatmentResponseDTO } from '../../../../types/practitioner.types';
import { DAY_LABELS, type DayOfWeek } from '../../utils/dayOfWeek';
import { deriveDisplayStatus } from '../../utils/offerStatus';
import OfferStatusChip from './OfferStatusChip';

export interface TreatmentCardActions {
  onEdit: (offer: OfferedTreatmentResponseDTO) => void;
  onDelete: (offer: OfferedTreatmentResponseDTO) => void;
  onPause: (offer: OfferedTreatmentResponseDTO) => void;
  onResume: (offer: OfferedTreatmentResponseDTO) => void;
  onReactivate: (offer: OfferedTreatmentResponseDTO) => void;
  onRenewDates: (offer: OfferedTreatmentResponseDTO) => void;
}

interface TreatmentCardProps extends TreatmentCardActions {
  treatment: OfferedTreatmentResponseDTO;
  completedPatientsCount?: number;
  busy?: boolean;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export default function TreatmentCard({
  treatment,
  completedPatientsCount,
  busy,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onReactivate,
  onRenewDates,
}: TreatmentCardProps) {
  const display = deriveDisplayStatus(treatment);
  const isArchived = display === 'INACTIVE';
  const isPaused = display === 'PAUSED';
  const isExpired = display === 'EXPIRED';

  const {
    treatment: treatmentInfo,
    requirements,
    durationInMinutes,
    availabilitySlots,
    offerStartDate,
    offerEndDate,
    maxCompletedAttentions,
  } = treatment;

  const attended = completedPatientsCount ?? treatment.currentCompletedAttentions ?? 0;
  const quota = maxCompletedAttentions ?? 0;
  const hasProgressData = quota > 0;
  const progressValue = hasProgressData ? Math.min((attended / quota) * 100, 100) : 0;

  const slotsByDay = availabilitySlots.reduce<Record<string, string[]>>((acc, slot) => {
    const dayLabel = DAY_LABELS[slot.dayOfWeek as DayOfWeek] ?? slot.dayOfWeek;
    const range = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
    if (!acc[dayLabel]) acc[dayLabel] = [];
    acc[dayLabel].push(range);
    return acc;
  }, {});

  const uniqueDays = Array.from(new Set(availabilitySlots.map((s) => s.dayOfWeek)));

  const primaryAction = computePrimaryAction({
    display,
    treatment,
    busy,
    onEdit,
    onPause,
    onResume,
    onReactivate,
    onRenewDates,
  });

  const secondaryActions = computeSecondaryActions({
    display,
    treatment,
    onEdit,
    onPause,
    onDelete,
  });

  return (
    <Card
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isArchived || isPaused
          ? alpha(theme.palette.text.primary, 0.02)
          : theme.palette.background.paper,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: theme.shadows[isArchived ? 1 : 4],
          borderColor: isArchived ? 'divider' : 'primary.light',
        },
      })}
    >
      <Box
        sx={(theme) => ({
          px: 2.5,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isArchived || isPaused
            ? 'transparent'
            : alpha(theme.palette.primary.main, 0.03),
        })}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              lineHeight: 1.3,
              color: isArchived ? 'text.secondary' : 'text.primary',
            }}
          >
            {treatmentInfo.name}
          </Typography>
          <OfferStatusChip status={display} />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            label={treatmentInfo.area}
            size="small"
            color={isArchived ? 'default' : 'primary'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${durationInMinutes} min`}
            size="small"
            variant="outlined"
            icon={<Schedule sx={{ fontSize: '1rem !important' }} />}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {treatmentInfo.description && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {treatmentInfo.description}
          </Typography>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, px: 2.5, pt: 2, pb: 1.5 }}>
        {isArchived && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 2,
              p: 1.25,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
              borderLeft: '3px solid',
              borderColor: 'text.disabled',
            }}
          >
            No visible para los pacientes. Tu historial clínico se conserva. Podés reactivarla cuando quieras.
          </Typography>
        )}

        {isPaused && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 2,
              p: 1.25,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.06),
              borderLeft: '3px solid',
              borderColor: 'secondary.main',
            }}
          >
            Oferta pausada. Los turnos ya agendados y las atenciones en curso continúan normalmente.
          </Typography>
        )}

        {isExpired && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 2,
              p: 1.25,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.warning.main, 0.06),
              borderLeft: '3px solid',
              borderColor: 'warning.main',
            }}
          >
            La fecha de fin ya pasó. Renová el período para volver al catálogo público.
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2,
            opacity: isArchived ? 0.7 : 1,
          }}
        >
          <Box>
            <SectionLabel icon={<CalendarMonth />} text="Disponibilidad" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {uniqueDays.map((dayKey) => (
                <Chip
                  key={dayKey}
                  label={DAY_LABELS[dayKey as DayOfWeek] ?? dayKey}
                  size="small"
                  variant="outlined"
                  color={isArchived ? 'default' : 'primary'}
                  sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <SectionLabel icon={<Schedule />} text="Horarios" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {Object.entries(slotsByDay).map(([day, times]) => (
                <Typography key={day} variant="body2" sx={{ fontSize: '0.8rem' }}>
                  <Box component="span" fontWeight={600}>{day}:</Box>{' '}
                  {times.join(', ')}
                </Typography>
              ))}
            </Box>
          </Box>

          {(offerStartDate || offerEndDate) && (
            <Box>
              <SectionLabel icon={<CalendarMonth />} text="Período" tone="secondary" />
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                {formatDate(offerStartDate)} — {formatDate(offerEndDate)}
              </Typography>
            </Box>
          )}

          {hasProgressData && (
            <Box>
              <SectionLabel icon={<Schedule />} text="Cupo" tone="secondary" />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                  {attended} de {quota}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progressValue)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                color={display === 'QUOTA_FULL' ? 'info' : 'primary'}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: (t) =>
                    alpha(display === 'QUOTA_FULL' ? t.palette.info.main : t.palette.primary.main, 0.12),
                  '& .MuiLinearProgress-bar': { borderRadius: 999 },
                }}
              />
            </Box>
          )}
        </Box>

        {requirements && !isArchived && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: (t) => alpha(t.palette.warning.main, 0.06),
                border: '1px solid',
                borderColor: (t) => alpha(t.palette.warning.main, 0.2),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="warning.dark"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                >
                  Indicaciones
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {requirements}
              </Typography>
            </Paper>
          </>
        )}
      </CardContent>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: 2.5, py: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Button
          variant={primaryAction.variant ?? 'contained'}
          color={primaryAction.color ?? 'primary'}
          size="small"
          startIcon={primaryAction.icon}
          onClick={primaryAction.onClick}
          disabled={busy}
          sx={{ flex: 1, fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
        >
          {primaryAction.label}
        </Button>
        {secondaryActions.length > 0 && (
          <CardActionsMenu actions={secondaryActions} busy={busy} />
        )}
      </Stack>
    </Card>
  );
}

interface ActionDescriptor {
  label: string;
  icon: ReactElement;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  tooltip?: string;
  destructive?: boolean;
}

interface ComputeArgs {
  display: ReturnType<typeof deriveDisplayStatus>;
  treatment: OfferedTreatmentResponseDTO;
  busy?: boolean;
  onEdit: (o: OfferedTreatmentResponseDTO) => void;
  onPause: (o: OfferedTreatmentResponseDTO) => void;
  onResume: (o: OfferedTreatmentResponseDTO) => void;
  onReactivate: (o: OfferedTreatmentResponseDTO) => void;
  onRenewDates: (o: OfferedTreatmentResponseDTO) => void;
  onDelete?: (o: OfferedTreatmentResponseDTO) => void;
}

function computePrimaryAction(args: ComputeArgs): ActionDescriptor {
  const { display, treatment, onEdit, onResume, onReactivate, onRenewDates } = args;
  switch (display) {
    case 'INACTIVE':
      return {
        label: 'Reactivar',
        icon: <RestartAlt />,
        onClick: () => onReactivate(treatment),
        variant: 'contained',
        color: 'primary',
      };
    case 'PAUSED':
      return {
        label: 'Reanudar',
        icon: <PlayCircleOutline />,
        onClick: () => onResume(treatment),
        variant: 'contained',
        color: 'primary',
      };
    case 'EXPIRED':
      return {
        label: 'Renovar fechas',
        icon: <EventRepeat />,
        onClick: () => onRenewDates(treatment),
        variant: 'contained',
        color: 'primary',
      };
    case 'QUOTA_FULL':
      return {
        label: 'Aumentar cupo',
        icon: <Edit />,
        onClick: () => onEdit(treatment),
        variant: 'contained',
        color: 'primary',
      };
    case 'SCHEDULED':
    case 'ACTIVE':
    default:
      return {
        label: 'Editar',
        icon: <Edit />,
        onClick: () => onEdit(treatment),
        variant: 'outlined',
        color: 'primary',
      };
  }
}

function computeSecondaryActions(
  args: Pick<ComputeArgs, 'display' | 'treatment' | 'onEdit' | 'onPause'> & {
    onDelete: (o: OfferedTreatmentResponseDTO) => void;
  }
): ActionDescriptor[] {
  const { display, treatment, onEdit, onPause, onDelete } = args;
  const list: ActionDescriptor[] = [];

  const bookableOrExpired =
    display === 'ACTIVE' ||
    display === 'SCHEDULED' ||
    display === 'EXPIRED' ||
    display === 'QUOTA_FULL';

  if (bookableOrExpired) {
    // For QUOTA_FULL the primary action already is "Aumentar cupo" (which
    // is an Edit), so we skip the secondary Editar entry. Same for EXPIRED
    // — primary is "Renovar fechas".
    if (display === 'ACTIVE' || display === 'SCHEDULED') {
      list.push({
        label: 'Pausar',
        icon: <PauseCircleOutline />,
        onClick: () => onPause(treatment),
      });
    }
    if (display === 'EXPIRED' || display === 'QUOTA_FULL') {
      list.push({
        label: 'Editar',
        icon: <Edit />,
        onClick: () => onEdit(treatment),
      });
      list.push({
        label: 'Pausar',
        icon: <PauseCircleOutline />,
        onClick: () => onPause(treatment),
      });
    }
  }

  list.push({
    label: display === 'INACTIVE' ? 'Eliminar definitivamente' : 'Eliminar del catálogo',
    icon: <Delete />,
    onClick: () => onDelete(treatment),
    destructive: true,
  });

  return list;
}

interface CardActionsMenuProps {
  actions: ActionDescriptor[];
  busy?: boolean;
}

function CardActionsMenu({ actions, busy }: CardActionsMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  return (
    <>
      <Tooltip title="Más acciones">
        <span>
          <IconButton
            size="small"
            onClick={(e) => setAnchor(e.currentTarget)}
            disabled={busy}
            aria-label="Más acciones"
          >
            <MoreVert />
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
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              setAnchor(null);
              action.onClick();
            }}
            sx={{ color: action.destructive ? 'error.main' : 'text.primary', gap: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { fontSize: 18 } }}>
              {action.icon}
            </Box>
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

interface SectionLabelProps {
  icon: ReactElement;
  text: string;
  tone?: 'primary' | 'secondary';
}

function SectionLabel({ icon, text, tone = 'primary' }: SectionLabelProps) {
  const color = tone === 'primary' ? 'primary.main' : 'secondary.main';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
      <Box sx={{ color, display: 'flex', '& svg': { fontSize: 18 } }}>{icon}</Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {text}
      </Typography>
    </Box>
  );
}
