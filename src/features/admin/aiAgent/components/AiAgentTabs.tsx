import { useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  LibraryBooks as LibraryIcon,
  Gavel as GavelIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import DiscardChangesDialog from './common/DiscardChangesDialog';
import { useAiAgentContext, type AiAgentTabId } from './AiAgentContext';

interface TabSpec {
  id: AiAgentTabId;
  path: string;
  label: string;
  icon: React.ReactElement;
}

const TABS: TabSpec[] = [
  { id: 'dashboard', path: 'dashboard', label: 'Estado', icon: <DashboardIcon /> },
  { id: 'configuration', path: 'configuration', label: 'Configuración', icon: <SettingsIcon /> },
  { id: 'guardrails', path: 'guardrails', label: 'Guardrails', icon: <ShieldIcon /> },
  { id: 'knowledge-base', path: 'knowledge-base', label: 'Knowledge Base', icon: <LibraryIcon /> },
  { id: 'governance', path: 'governance', label: 'Gobernanza', icon: <GavelIcon /> },
  { id: 'history', path: 'history', label: 'Historial', icon: <HistoryIcon /> },
];

const BASE_PATH = '/admin/ai-agent';

export default function AiAgentTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTabDirty } = useAiAgentContext();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const currentTab = useMemo<AiAgentTabId>(() => {
    const segment = location.pathname.replace(`${BASE_PATH}/`, '').split('/')[0];
    const found = TABS.find((t) => t.path === segment);
    return found ? found.id : 'dashboard';
  }, [location.pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: AiAgentTabId) => {
    if (newValue === currentTab) return;
    const targetPath = `${BASE_PATH}/${newValue}`;
    if (isTabDirty(currentTab)) {
      setPendingNavigation(targetPath);
      return;
    }
    navigate(targetPath);
  };

  const handleDiscard = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleCancel = () => setPendingNavigation(null);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Secciones del agente IA"
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>
      <DiscardChangesDialog
        open={pendingNavigation !== null}
        onCancel={handleCancel}
        onDiscard={handleDiscard}
      />
    </Box>
  );
}
