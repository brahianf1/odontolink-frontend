import { useRef, useState, type DragEvent } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CloudUpload as UploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import {
  ACCEPT_ATTR,
  formatBytes,
  validateFile,
} from '../../utils/kbFileValidation';

interface FileDropzoneProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
}

export default function FileDropzone({ file, onFileSelected, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => {
    inputRef.current?.click();
  };

  const handleFile = (f: File | null) => {
    if (!f) {
      onFileSelected(null);
      setError(null);
      return;
    }
    const validation = validateFile(f);
    if (validation) {
      setError(validation);
      onFileSelected(null);
      return;
    }
    setError(null);
    onFileSelected(f);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0] ?? null;
    event.target.value = '';
    handleFile(f);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    const f = event.dataTransfer.files?.[0] ?? null;
    handleFile(f);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  return (
    <Box>
      <Box
        onClick={disabled ? undefined : pickFile}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        sx={{
          border: '1.5px dashed',
          borderColor: dragOver ? 'primary.main' : error ? 'error.main' : 'divider',
          backgroundColor: dragOver ? 'action.hover' : 'background.default',
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          {file ? (
            <>
              <FileIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(file.size)}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFile(null);
                }}
              >
                Quitar archivo
              </Button>
            </>
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Typography variant="body2" fontWeight={600}>
                Arrastrá un archivo aquí o hacé clic para seleccionarlo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Permitidos: PDF, TXT, MD, CSV, JSON, DOCX. Máx. 10 MB.
              </Typography>
            </>
          )}
        </Stack>
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        hidden
        onChange={onChange}
      />
    </Box>
  );
}
