import { Box, Link, Typography } from '@mui/material';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatbotMarkdownContentProps {
  content: string;
}

const components: Components = {
  p: ({ children }) => (
    <Typography
      variant="body2"
      sx={{
        lineHeight: 1.5,
        my: 0.5,
        wordBreak: 'break-word',
        '&:first-of-type': { mt: 0 },
        '&:last-of-type': { mb: 0 },
      }}
    >
      {children}
    </Typography>
  ),
  strong: ({ children }) => (
    <Box component="strong" sx={{ fontWeight: 700 }}>
      {children}
    </Box>
  ),
  em: ({ children }) => (
    <Box component="em" sx={{ fontStyle: 'italic' }}>
      {children}
    </Box>
  ),
  ul: ({ children }) => (
    <Box
      component="ul"
      sx={{
        pl: 2.5,
        my: 0.5,
        '& li': { my: 0.25 },
        '& ul, & ol': { my: 0.25 },
      }}
    >
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box
      component="ol"
      sx={{
        pl: 2.5,
        my: 0.5,
        '& li': { my: 0.25 },
        '& ul, & ol': { my: 0.25 },
      }}
    >
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography
      component="li"
      variant="body2"
      sx={{ lineHeight: 1.5, wordBreak: 'break-word' }}
    >
      {children}
    </Typography>
  ),
  a: ({ children, href }) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ wordBreak: 'break-word', color: 'inherit', textDecorationColor: 'currentcolor' }}
    >
      {children}
    </Link>
  ),
  code: ({ children }) => (
    <Box
      component="code"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.85em',
        px: 0.5,
        py: 0.125,
        bgcolor: 'action.hover',
        borderRadius: 0.5,
        wordBreak: 'break-word',
      }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.85em',
        p: 1,
        my: 0.75,
        bgcolor: 'action.hover',
        borderRadius: 1,
        overflowX: 'auto',
        '& code': {
          p: 0,
          bgcolor: 'transparent',
          fontSize: 'inherit',
        },
      }}
    >
      {children}
    </Box>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: 3,
        borderColor: 'divider',
        pl: 1.5,
        my: 0.75,
        color: 'text.secondary',
        '& p': { color: 'inherit' },
      }}
    >
      {children}
    </Box>
  ),
  hr: () => (
    <Box
      component="hr"
      sx={{ border: 0, borderTop: 1, borderColor: 'divider', my: 1 }}
    />
  ),
  h1: ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.75, mb: 0.25 }}>
      {children}
    </Typography>
  ),
  h5: ({ children }) => (
    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.75, mb: 0.25 }}>
      {children}
    </Typography>
  ),
  h6: ({ children }) => (
    <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.75, mb: 0.25 }}>
      {children}
    </Typography>
  ),
  table: ({ children }) => (
    <Box
      component="table"
      sx={{
        my: 0.75,
        borderCollapse: 'collapse',
        fontSize: '0.85em',
        '& th, & td': {
          border: 1,
          borderColor: 'divider',
          px: 0.75,
          py: 0.5,
          textAlign: 'left',
        },
        '& th': { fontWeight: 700, bgcolor: 'action.hover' },
      }}
    >
      {children}
    </Box>
  ),
};

export default function ChatbotMarkdownContent({ content }: ChatbotMarkdownContentProps) {
  return (
    <Box
      sx={{
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-of-type': { mb: 0 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}
