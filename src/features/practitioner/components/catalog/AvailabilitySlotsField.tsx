import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import {
  Controller,
  useFieldArray,
  useWatch,
  type ArrayPath,
  type Control,
  type FieldErrors,
  type Path,
} from 'react-hook-form';
import type { AvailabilitySlotDTO } from '../../../../types/practitioner.types';
import { DAYS_OF_WEEK, type DayOfWeek } from '../../utils/dayOfWeek';
import { findSlotConflicts } from '../../utils/slotValidation';

type FormShape = { availabilitySlots: AvailabilitySlotDTO[] };

interface AvailabilitySlotsFieldProps<TForm extends FormShape> {
  control: Control<TForm>;
  errors?: FieldErrors<TForm>;
}

const NEW_SLOT: AvailabilitySlotDTO = {
  dayOfWeek: 'MONDAY',
  startTime: '09:00:00',
  endTime: '12:00:00',
};

export default function AvailabilitySlotsField<TForm extends FormShape>({
  control,
  errors,
}: AvailabilitySlotsFieldProps<TForm>) {
  const fieldName = 'availabilitySlots' as ArrayPath<TForm>;

  const { fields, append, remove } = useFieldArray<TForm>({
    control,
    name: fieldName,
  });

  const watched = useWatch({ control, name: fieldName as Path<TForm> }) as
    | AvailabilitySlotDTO[]
    | undefined;

  const conflicts = useMemo(
    () => findSlotConflicts(watched ?? []),
    [watched]
  );
  const conflictMap = useMemo(() => {
    const map = new Map<number, string[]>();
    conflicts.forEach((c) => {
      const list = map.get(c.index) ?? [];
      list.push(c.message);
      map.set(c.index, list);
    });
    return map;
  }, [conflicts]);

  const rootError = (errors as FieldErrors<FormShape>)?.availabilitySlots;
  const rootMessage =
    typeof rootError === 'object' && rootError && 'message' in rootError
      ? String(rootError.message)
      : undefined;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Disponibilidad horaria
        </Typography>
        <Button
          startIcon={<Add />}
          onClick={() => append(NEW_SLOT as never)}
          size="small"
          variant="outlined"
        >
          Agregar horario
        </Button>
      </Box>

      {fields.length === 0 ? (
        <Alert severity={rootMessage ? 'error' : 'info'}>
          {rootMessage ?? 'Agrega al menos un bloque (día + rango horario).'}
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {fields.map((slot, index) => {
            const slotErrors = conflictMap.get(index);
            return (
              <Paper
                key={slot.id}
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  border: '1px solid',
                  borderColor: slotErrors ? 'error.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    slotErrors
                      ? alpha(theme.palette.error.main, 0.04)
                      : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`Horario ${index + 1}`}
                      size="small"
                      color={slotErrors ? 'error' : 'primary'}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                      aria-label="Eliminar horario"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  <Controller
                    control={control}
                    name={`${fieldName}.${index}.dayOfWeek` as Path<TForm>}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Día"
                        size="small"
                        fullWidth
                        value={(field.value as DayOfWeek) ?? 'MONDAY'}
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <MenuItem key={d.value} value={d.value}>
                            {d.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.startTime` as Path<TForm>}
                      render={({ field }) => (
                        <TextField
                          label="Hora inicio"
                          type="time"
                          size="small"
                          name={field.name}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          value={(field.value as string)?.substring(0, 5) ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? `${e.target.value}:00` : '')
                          }
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 900 }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.endTime` as Path<TForm>}
                      render={({ field }) => (
                        <TextField
                          label="Hora fin"
                          type="time"
                          size="small"
                          name={field.name}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          value={(field.value as string)?.substring(0, 5) ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? `${e.target.value}:00` : '')
                          }
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 900 }}
                        />
                      )}
                    />
                  </Box>

                  {slotErrors && (
                    <Alert severity="error" variant="outlined" sx={{ py: 0.5 }}>
                      {slotErrors.join(' · ')}
                    </Alert>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
