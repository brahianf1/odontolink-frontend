import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface DiscardChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  title?: string;
  description?: string;
}

export default function DiscardChangesDialog({
  open,
  onCancel,
  onDiscard,
  title = 'Cambios sin guardar',
  description = 'Tenés cambios sin guardar en esta sección. Si continuás, se perderán.',
}: DiscardChangesDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onDiscard}>
          Descartar y continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
