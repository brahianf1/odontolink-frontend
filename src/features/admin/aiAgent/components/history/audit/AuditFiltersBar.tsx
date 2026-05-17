import { MenuItem, Stack, TextField } from '@mui/material';
import type {
  AiAdminAuditEventType,
  AuditEventsQuery,
} from '../../../../../../types/aiAgent.types';
import { auditTypeMeta } from '../../../utils/auditTypes';

interface AuditFiltersBarProps {
  query: AuditEventsQuery;
  onChange: (query: Partial<AuditEventsQuery>) => void;
  disabled?: boolean;
}

const TYPES: AiAdminAuditEventType[] = [
  'AGENT_PUBLISH',
  'AGENT_PUBLISH_FAILED',
  'AGENT_ROLLBACK',
  'GOVERNANCE_POLICY_UPDATED',
];

const toIsoStart = (value: string): string | undefined => {
  if (!value) return undefined;
  return `${value}T00:00:00Z`;
};

const toIsoEnd = (value: string): string | undefined => {
  if (!value) return undefined;
  // backend usa rango half-open exclusivo en 'to'
  return `${value}T00:00:00Z`;
};

const fromIso = (value?: string): string => {
  if (!value) return '';
  return value.slice(0, 10);
};

export default function AuditFiltersBar({ query, onChange, disabled }: AuditFiltersBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ mb: 2 }}
    >
      <TextField
        select
        size="small"
        label="Tipo"
        value={query.type ?? ''}
        onChange={(e) =>
          onChange({
            type: e.target.value === '' ? undefined : (e.target.value as AiAdminAuditEventType),
          })
        }
        disabled={disabled}
        sx={{ minWidth: 220 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {TYPES.map((t) => (
          <MenuItem key={t} value={t}>
            {auditTypeMeta(t).label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        type="date"
        label="Desde (inclusivo)"
        InputLabelProps={{ shrink: true }}
        value={fromIso(query.from)}
        onChange={(e) => onChange({ from: toIsoStart(e.target.value) })}
        disabled={disabled}
      />
      <TextField
        size="small"
        type="date"
        label="Hasta (exclusivo)"
        InputLabelProps={{ shrink: true }}
        value={fromIso(query.to)}
        onChange={(e) => onChange({ to: toIsoEnd(e.target.value) })}
        disabled={disabled}
      />
    </Stack>
  );
}
