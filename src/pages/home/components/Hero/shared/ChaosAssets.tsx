import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PublicIcon from '@mui/icons-material/Public';
import DoneAllIcon from '@mui/icons-material/DoneAll';

type CardProps = {
  rotation?: number;
  width?: number | string;
};

const baseCardSx = (theme: Theme, rotation = 0) => ({
  border: `1px solid ${theme.palette.outlineVariant}`,
  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
  fontFamily:
    '"Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
});

export const FacebookPostCard = ({ rotation = -4, width = 320 }: CardProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width,
        backgroundColor: '#FFFFFF',
        color: '#050505',
        ...baseCardSx(theme, rotation),
      }}
    >
      {/* Top bar (mocked FB blue) */}
      <Box sx={{ backgroundColor: '#1877F2', height: 32, px: 1.5, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: -0.3 }}>
          facebook
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#FF8F1F',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              borderRadius: '50%',
            }}
          >
            LO
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>
              Lucas O. · Pacientes Odontología Tucumán
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#65676B', fontSize: 11 }}>
              <span>hace 14 min</span>
              <span>·</span>
              <PublicIcon sx={{ fontSize: 12 }} />
            </Stack>
          </Box>
          <MoreHorizIcon sx={{ color: '#65676B' }} />
        </Stack>
        <Typography sx={{ fontSize: 14, lineHeight: 1.45, mb: 1.5 }}>
          ¡BUSCO PACIENTES! 🦷 Soy estudiante de 4° año, necesito hacer un conducto y una limpieza
          para presentar. Mandame mensaje al privado o WhatsApp 381 ... 🙏
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-around"
          sx={{
            borderTop: `1px solid ${alpha('#000', 0.08)}`,
            pt: 1,
            color: '#65676B',
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12 }}>Me gusta</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12 }}>Comentar (23)</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ShareOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12 }}>Compartir</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

const WhatsAppBubble = ({
  text,
  mine,
  time,
}: {
  text: string;
  mine?: boolean;
  time: string;
}) => (
  <Box
    sx={{
      maxWidth: '80%',
      px: 1,
      py: 0.5,
      alignSelf: mine ? 'flex-end' : 'flex-start',
      backgroundColor: mine ? '#DCF8C6' : '#FFFFFF',
      color: '#111B21',
      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
      fontSize: 13,
    }}
  >
    <Box>{text}</Box>
    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.25 }}>
      <Typography sx={{ fontSize: 10, color: '#667781' }}>{time}</Typography>
      {mine && <DoneAllIcon sx={{ fontSize: 12, color: '#53BDEB' }} />}
    </Stack>
  </Box>
);

export const WhatsAppChatCard = ({ rotation = 5, width = 280 }: CardProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width,
        backgroundColor: '#E5DDD5',
        color: '#111B21',
        ...baseCardSx(theme, rotation),
        backgroundImage: `linear-gradient(${alpha('#fff', 0.04)}, ${alpha('#fff', 0.04)})`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ backgroundColor: '#075E54', color: '#fff', px: 1.5, py: 1 }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            backgroundColor: '#128C7E',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          AP
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>+543813252102</Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.85 }}>en línea</Typography>
        </Box>
      </Stack>
      <Stack spacing={1} sx={{ p: 1.25 }}>
        <WhatsAppBubble text="Hola! Vi el cartel en face" time="14:02" />
        <WhatsAppBubble text="Sí, me podés pasar tu DNI y obra social?" mine time="14:03" />
        <WhatsAppBubble text="Y una foto del diente por favor 🦷" mine time="14:03" />
        <WhatsAppBubble text="Mando todo por acá nomás?" time="14:05" />
      </Stack>
    </Box>
  );
};

export const PaperFlyerCard = ({ rotation = -8, width = 240 }: CardProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width,
        backgroundColor: '#FFF8E6',
        color: '#3A2E0A',
        p: 2.5,
        ...baseCardSx(theme, rotation),
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 18px)',
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontWeight: 700,
          fontSize: 18,
          mb: 1,
          textAlign: 'center',
          letterSpacing: 1,
        }}
      >
        SE BUSCAN
        <br />
        PACIENTES
      </Typography>
      <Typography sx={{ fontSize: 12, mb: 1.5, lineHeight: 1.5 }}>
        Estudiante de Odontología — UNT necesita pacientes para prácticas obligatorias.
        Limpieza · conducto · obturación.
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
        Llamar / WhatsApp:
        <br />
        381-555-0143
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: '"Courier New", monospace',
          fontSize: 10,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>381-555</span>
        ))}
      </Box>
    </Box>
  );
};

export const BulletinPostCard = ({ rotation = 3, width = 260 }: CardProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width,
        backgroundColor: '#fff',
        color: '#222',
        p: 2,
        ...baseCardSx(theme, rotation),
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 16,
          color: '#B0001A',
          letterSpacing: 1,
          mb: 0.5,
        }}
      >
        URGENTE — PACIENTES
      </Typography>
      <Typography sx={{ fontSize: 12, mb: 1.5, lineHeight: 1.4 }}>
        Práctica clínica · Tratamiento sin costo · Sin obra social.
        Comunicarse por WhatsApp o Messenger.
      </Typography>
      <Box
        sx={{
          backgroundColor: '#F1F3F5',
          fontFamily: '"Courier New", monospace',
          fontSize: 11,
          p: 1,
          textAlign: 'center',
        }}
      >
        publicado en grupo · pacientes odonto tuc
      </Box>
    </Box>
  );
};
