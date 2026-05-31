import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import StatusChip from '../../../../components/common/StatusChip';
import UserAvatar from '../../../../components/common/UserAvatar';
import PatientAttentionsList from './PatientAttentionsList';
import type { PatientSummary } from './PatientCard';

interface PatientListTableProps {
  patients: PatientSummary[];
}

const lastAttentionDate = (patient: PatientSummary): string | null => {
  if (patient.attentions.length === 0) return null;
  const dates = patient.attentions
    .map((a) => parseISO(a.startDate).getTime())
    .filter((t) => !Number.isNaN(t));
  if (dates.length === 0) return null;
  return format(new Date(Math.max(...dates)), "dd 'de' MMM yyyy", { locale: es });
};

/**
 * Dense view of the practitioner's patients. Each row exposes a single
 * "Ver atenciones" CTA that opens a modal listing the patient's full
 * attention history through the same component the card-view expand uses.
 */
export default function PatientListTable({ patients }: PatientListTableProps) {
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                En curso
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Última atención</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => {
              const lastDate = lastAttentionDate(patient);
              return (
                <TableRow
                  key={patient.id}
                  hover
                  onClick={() => setSelectedPatient(patient)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <UserAvatar
                        src={patient.profilePictureUrl}
                        name={patient.name}
                        size={36}
                        sx={(theme) => ({
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          border: `1px solid ${theme.palette.divider}`,
                        })}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {patient.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{patient.totalCount}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {patient.activeCount > 0 ? (
                      <StatusChip label={String(patient.activeCount)} tone="primary" />
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        0
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {lastDate ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                      }}
                    >
                      Ver atenciones
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay pacientes en esta vista.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={selectedPatient != null}
        onClose={() => setSelectedPatient(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Atenciones de {selectedPatient?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedPatient?.totalCount ?? 0} atención
              {selectedPatient?.totalCount === 1 ? '' : 'es'} ·{' '}
              {selectedPatient?.activeCount ?? 0} en curso
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedPatient(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <PatientAttentionsList attentions={selectedPatient.attentions} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
