import { Avatar, type AvatarProps } from '@mui/material';

/**
 * Derives up-to-two-letter initials from a full display name. Falls back to
 * '?' when the name is empty. Mirrors the convention used across the app
 * (first + last token).
 */
const computeInitials = (name?: string | null): string => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export interface UserAvatarProps extends Omit<AvatarProps, 'src'> {
  /** Public profile picture URL. When null/undefined, initials are shown. */
  src?: string | null;
  /** Full display name — used for the image `alt` and to derive initials. */
  name?: string | null;
  /** Convenience square size in px (sets both width and height). */
  size?: number;
}

/**
 * Shared avatar for any user across the app. Renders the profile picture when
 * a URL is provided and falls back to the user's initials otherwise. MUI's
 * `<Avatar>` also falls back to the children (initials) automatically if the
 * image fails to load, so no explicit onError handling is needed.
 *
 * Callers can override the default tonal styling via `sx` (e.g. the lighter
 * `primary.50` background used in some grids).
 */
export default function UserAvatar({ src, name, size, sx, ...rest }: UserAvatarProps) {
  return (
    <Avatar
      src={src ?? undefined}
      alt={name ?? undefined}
      sx={[
        {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600,
          ...(size ? { width: size, height: size } : null),
        },
        // Caller overrides win; supports object, array, or theme-callback sx.
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {computeInitials(name)}
    </Avatar>
  );
}
