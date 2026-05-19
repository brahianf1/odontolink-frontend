import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatbotInfo } from '../hooks/useChatbotInfo';
import ChatbotFab from './ChatbotFab';
import ChatbotPanel from './ChatbotPanel';

const EXCLUDED_EXACT_PATHS = ['/login', '/forgot-password', '/reset-password'];
const EXCLUDED_PREFIXES = ['/register/'];

const isWidgetExcluded = (pathname: string): boolean => {
  if (EXCLUDED_EXACT_PATHS.includes(pathname)) return true;
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export default function ChatbotWidget() {
  const location = useLocation();
  const excluded = isWidgetExcluded(location.pathname);
  const { info, loading, error, refresh } = useChatbotInfo();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (excluded && open) setOpen(false);
  }, [excluded, open]);

  if (excluded) return null;

  // While we don't know whether access is granted, render nothing to avoid
  // a flash of the FAB that then disappears.
  if (loading && !info) return null;
  if (error) return null;
  if (!info) return null;

  // Stealth: si el backend no concede acceso (agente PRIVATE con visitante
  // anónimo, agente DISABLED/NOT_PUBLISHED, rol no permitido), el widget no
  // se renderiza — ni FAB ni Panel. No quedan rastros en el DOM que un user
  // pudiera des-ocultar desde DevTools. El backend es la barrera real
  // (POST /messages devuelve 401/403) y el frontend respeta esa señal.
  if (!info.accessGranted) return null;

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      void refresh();
    }
  };

  return (
    <>
      <ChatbotFab open={open} displayName={info.displayName} onClick={handleToggle} />
      <ChatbotPanel
        open={open}
        loading={loading}
        error={error}
        info={info}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
