import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Fade, IconButton } from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import type { ChatbotMessage } from '../../../types/chatbot.types';
import ChatbotMessageBubble from './ChatbotMessageBubble';
import ChatbotTypingIndicator from './ChatbotTypingIndicator';
import ChatbotWelcomeScreen from './ChatbotWelcomeScreen';

interface ChatbotMessageListProps {
  messages: ChatbotMessage[];
  displayName?: string;
  welcomeMessage?: string;
  canRegenerate?: boolean;
  onRetry?: (messageId: string) => void;
  onRegenerate?: () => void;
}

const SCROLL_THRESHOLD_PX = 120;

export default function ChatbotMessageList({
  messages,
  displayName,
  welcomeMessage,
  canRegenerate = false,
  onRetry,
  onRegenerate,
}: ChatbotMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastAnchoredUserIdRef = useRef<string | null>(null);
  const userHasScrolledRef = useRef(false);
  const lastProgrammaticScrollAtRef = useRef(0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const hasRealMessages = messages.some((m) => m.role !== 'system');
  const isTypingVisible = messages.some((m) => m.role === 'system');
  const realMessages = useMemo(
    () => messages.filter((m) => m.role !== 'system'),
    [messages]
  );

  // ID del último mensaje del bot — sólo el último ofrece "regenerar respuesta".
  const lastBotMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'bot') return messages[i].id;
    }
    return null;
  }, [messages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Al montar: aterrizar al final (mostrar últimos mensajes si hay historial).
  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setShowScrollBottom(distance > SCROLL_THRESHOLD_PX);
      // Si el scroll event NO viene de un scrollTo programático reciente
      // (ventana de 500ms cubre la animación smooth), lo atribuimos al user.
      // Una vez marcado, dejamos de re-anclar hasta el próximo envío.
      const sinceProgrammatic = Date.now() - lastProgrammaticScrollAtRef.current;
      if (sinceProgrammatic > 500) {
        userHasScrolledRef.current = true;
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Patrón "anchor user message to top" (ChatGPT/Claude/Gemini): cuando entra
  // un mensaje nuevo del user, lo posicionamos al top del viewport. El typing
  // indicator y la respuesta del bot van llenando abajo, dejando todo el
  // espacio disponible para que el user lea desde el inicio sin scroll manual.
  //
  // Calculamos manualmente el offsetTop del bubble dentro del container y
  // hacemos scrollTo. Es más robusto que scrollIntoView (que escala ancestros
  // y puede ser pisado por focus() del composer o por scrolls programáticos
  // del browser).
  //
  // RE-ANCHOR: el primer anchor (cuando llega el user message) suele quedar
  // clampeado al max scroll porque todavía no hay contenido suficiente abajo
  // (sólo el user message). Cuando llega el typing y la respuesta del bot el
  // contenido crece y el target se vuelve alcanzable. Por eso re-anclamos en
  // cada update de messages hasta que el user scrollee manualmente (en ese
  // momento liberamos el ancla y respetamos su scroll).
  useEffect(() => {
    let lastUserId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserId = messages[i].id;
        break;
      }
    }
    if (!lastUserId) return;

    const isNewUserMessage = lastUserId !== lastAnchoredUserIdRef.current;
    if (isNewUserMessage) {
      lastAnchoredUserIdRef.current = lastUserId;
      // Nuevo envío → reseteo el flag para volver a anclar este turno.
      userHasScrolledRef.current = false;
      // Pre-emptive: cualquier scroll event causado por el layout shift
      // del nuevo mensaje (incluyendo welcome → messages) NO se cuenta como
      // user scroll, hasta que el raf haga el primer anchor real.
      lastProgrammaticScrollAtRef.current = Date.now();
    }

    if (userHasScrolledRef.current) return;

    const anchorId = lastUserId;
    const raf = requestAnimationFrame(() => {
      const container = scrollRef.current;
      const el = document.getElementById(`chatbot-msg-${anchorId}`);
      if (!container || !el) return;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const target = Math.max(
        0,
        elRect.top - containerRect.top + container.scrollTop - 12
      );
      // Smooth scroll condicional por distancia REAL al target alcanzable
      // (clampeado a maxScroll). Saltos grandes — típicamente el momento en
      // que llega la respuesta del bot y el contenido recién creció — usan
      // smooth para no sentirse abruptos. Micro-ajustes (typing, fallback)
      // usan instant para evitar acumular animaciones innecesarias.
      const maxScroll = Math.max(
        0,
        container.scrollHeight - container.clientHeight
      );
      const clampedTarget = Math.min(target, maxScroll);
      const distance = Math.abs(container.scrollTop - clampedTarget);
      if (distance < 2) return;
      lastProgrammaticScrollAtRef.current = Date.now();
      container.scrollTo({
        top: target,
        behavior: distance > 50 ? 'smooth' : 'auto',
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages]);

  return (
    <Box
      sx={{
        position: 'relative',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        ref={scrollRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          py: 1.5,
          backgroundColor: 'background.default',
        }}
      >
        {!hasRealMessages ? (
          <ChatbotWelcomeScreen
            displayName={displayName}
            welcomeMessage={welcomeMessage}
          />
        ) : (
          <>
            {realMessages.map((message) => (
              <ChatbotMessageBubble
                key={message.id}
                message={message}
                isLastBotMessage={message.id === lastBotMessageId}
                canRegenerate={canRegenerate}
                onRetry={onRetry}
                onRegenerate={onRegenerate}
              />
            ))}
            {/* Renderizado aparte para tener exit animation (fade-out) cuando
                el typing desaparece al llegar la respuesta del bot. MUI Fade
                aplica fade-in al mount y fade-out al cambiar in={false}. */}
            <Fade
              in={isTypingVisible}
              timeout={{ enter: 200, exit: 180 }}
              mountOnEnter
              unmountOnExit
            >
              <div>
                <ChatbotTypingIndicator displayName={displayName} />
              </div>
            </Fade>
          </>
        )}
      </Box>
      <Fade in={showScrollBottom} unmountOnExit>
        <IconButton
          onClick={() => scrollToBottom('smooth')}
          aria-label="Volver al final"
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 2,
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'background.paper' },
            zIndex: 1,
          }}
        >
          <ArrowDownIcon fontSize="small" />
        </IconButton>
      </Fade>
    </Box>
  );
}
