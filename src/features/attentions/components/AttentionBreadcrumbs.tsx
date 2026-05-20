import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbCrumb {
  label: string;
  to?: string;
}

interface AttentionBreadcrumbsProps {
  crumbs: BreadcrumbCrumb[];
}

/**
 * Renders a list of breadcrumbs where the last one is always rendered as
 * static text and the previous ones as router links if a `to` is provided.
 * Used by both the practitioner detail page and the supervisor audit page.
 */
export default function AttentionBreadcrumbs({ crumbs }: AttentionBreadcrumbsProps) {
  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        if (isLast || !crumb.to) {
          return (
            <Typography key={index} color="text.primary">
              {crumb.label}
            </Typography>
          );
        }
        return (
          <MuiLink key={index} component={RouterLink} to={crumb.to} underline="hover">
            {crumb.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
