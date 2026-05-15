import { forwardRef, useState } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
  showLockIcon?: boolean;
};

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ showLockIcon = true, InputProps, ...rest }, ref) {
    const [show, setShow] = useState(false);
    return (
      <TextField
        {...rest}
        inputRef={ref}
        type={show ? 'text' : 'password'}
        InputProps={{
          ...(InputProps ?? {}),
          startAdornment: showLockIcon ? (
            <InputAdornment position="start">
              <Lock color="action" fontSize="small" />
            </InputAdornment>
          ) : (
            InputProps?.startAdornment
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShow((value) => !value)}
                edge="end"
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={rest.disabled}
                tabIndex={-1}
              >
                {show ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
);
