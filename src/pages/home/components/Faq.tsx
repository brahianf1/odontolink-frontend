import { Accordion, AccordionDetails, AccordionSummary, Box, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SectionShell from './SectionShell';
import RevealOnView from '../motion/RevealOnView';
import { faqs } from '../data/faqs';
import { useState } from 'react';

export const Faq = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_: unknown, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <SectionShell
      id="faq"
      eyebrow="Preguntas frecuentes"
      title="Las dudas más comunes, respondidas."
      subtitle="Si necesitás algo más específico, escribinos desde el chat interno o por mail."
      background="container"
      align="left"
    >
      <RevealOnView
        staggerChildren={0.06}
        amount={0.05}
        style={{ maxWidth: 820 }}
      >
        {faqs.map((f, i) => {
          const id = `faq-${i}`;
          return (
            <Accordion
              key={id}
              expanded={expanded === id}
              onChange={handleChange(id)}
              sx={{
                borderTop: i === 0 ? `1px solid ${theme.palette.outlineVariant}` : 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${id}-content`}
                id={`${id}-header`}
                sx={{
                  py: 1,
                  '& .MuiAccordionSummary-content': { my: 1.5 },
                }}
              >
                <Typography variant="titleLarge" sx={{ fontWeight: 600 }}>
                  {f.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pb: 3, pt: 0 }}>
                <Typography variant="bodyLarge" sx={{ color: 'text.secondary', maxWidth: 720 }}>
                  {f.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );
        })}
        <Box sx={{ height: 1, backgroundColor: theme.palette.outlineVariant }} />
      </RevealOnView>
    </SectionShell>
  );
};

export default Faq;
