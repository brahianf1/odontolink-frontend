import { useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import type { MyProfileDTO } from '../../../types/profile.types';
import {
  deleteProfilePicture,
  uploadProfilePicture,
} from '../../../services/api/profileService';
import { useAuthStore } from '../../../store/authStore';
import {
  formatRetryMessage,
  getErrorMessage,
  getRetryAfterSeconds,
  isStatusCode,
} from '../utils/apiErrors';

interface ProfilePictureFieldProps {
  profile: MyProfileDTO;
  onProfilePictureChange: (newUrl: string | null) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

const buildInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  return `${first}${last}`.toUpperCase() || 'U';
};

export function ProfilePictureField({
  profile,
  onProfilePictureChange,
}: ProfilePictureFieldProps) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<
    | { severity: 'success' | 'error' | 'warning'; message: string }
    | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = buildInitials(profile.firstName, profile.lastName);
  const hasPicture = Boolean(profile.profilePictureUrl);

  const showError = (message: string) =>
    setFeedback({ severity: 'error', message });
  const showSuccess = (message: string) =>
    setFeedback({ severity: 'success', message });

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato no permitido. Subí una imagen JPEG o PNG.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'La imagen supera el tamaño máximo permitido (2 MB).';
    }
    return null;
  };

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const clientError = validateFile(file);
    if (clientError) {
      showError(clientError);
      return;
    }

    setBusy(true);
    try {
      const response = await uploadProfilePicture(file);
      const newUrl = response.profilePictureUrl;
      updateUser({ profilePictureUrl: newUrl });
      onProfilePictureChange(newUrl);
      showSuccess('Foto de perfil actualizada.');
    } catch (err) {
      if (isStatusCode(err, 429)) {
        showError(
          formatRetryMessage(
            getRetryAfterSeconds(err),
            'Demasiados intentos. Intentá nuevamente en unos minutos.'
          )
        );
      } else {
        showError(getErrorMessage(err, 'No se pudo subir la imagen.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteProfilePicture();
      updateUser({ profilePictureUrl: null });
      onProfilePictureChange(null);
      showSuccess('Foto de perfil eliminada.');
    } catch (err) {
      showError(getErrorMessage(err, 'No se pudo eliminar la foto.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack alignItems="center" spacing={1.5}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={profile.profilePictureUrl ?? undefined}
          alt={`${profile.firstName} ${profile.lastName}`}
          sx={{
            width: 128,
            height: 128,
            fontSize: '2.5rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
          }}
        >
          {initials}
        </Avatar>
        {busy ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          >
            <CircularProgress size={32} sx={{ color: 'common.white' }} />
          </Box>
        ) : null}
      </Box>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CameraIcon />}
          onClick={handlePick}
          disabled={busy}
        >
          {hasPicture ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        {hasPicture ? (
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={busy}
          >
            Quitar
          </Button>
        ) : null}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={handleFileChange}
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? (
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
}
