import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useThemeStore } from './store/themeStore';
import { lightTheme, darkTheme } from './theme/theme';
import PublicLayout from './components/PublicLayout';
import AuthLayout from './components/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import RegisterPractitionerPage from './pages/RegisterPractitionerPage';
import RegisterSupervisorPage from './pages/RegisterSupervisorPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import PractitionerDashboardPage from './pages/practitioner/PractitionerDashboardPage';
import TreatmentsPage from './pages/practitioner/TreatmentsPage';
import AppointmentsPage from './pages/practitioner/AppointmentsPage';
import AttentionsPage from './pages/practitioner/AttentionsPage';
import PatientsPage from './pages/practitioner/PatientsPage';
import PatientEvolutionPage from './pages/practitioner/PatientEvolutionPage';
import FeedbackPage from './pages/practitioner/FeedbackPage';
import ChatPage from './pages/practitioner/ChatPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientTreatmentsPage from './pages/patient/TreatmentsPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import MyAttentionsPage from './pages/patient/MyAttentionsPage';
import PatientFeedbackPage from './pages/patient/PatientFeedbackPage';
import PatientChatPage from './pages/patient/PatientChatPage';
import MyProfilePage from './pages/profile/MyProfilePage';
import BookingConfirmationPage from './pages/patient/BookingConfirmationPage';
import { PatientFeedbackProvider } from './features/patient';
import { useProfileSync } from './features/profile';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTreatmentsPage from './pages/admin/AdminTreatmentsPage';
import AdminAiAgentPage from './pages/admin/AdminAiAgentPage';
import {
  DashboardTab as AiAgentDashboardTab,
  ConfigurationTab as AiAgentConfigurationTab,
  GuardrailsTab as AiAgentGuardrailsTab,
  KnowledgeBaseTab as AiAgentKnowledgeBaseTab,
  GovernanceTab as AiAgentGovernanceTab,
  HistoryTab as AiAgentHistoryTab,
} from './features/admin/aiAgent';
import SupervisorDashboardPage from './pages/supervisor/SupervisorDashboardPage';
import MyPractitionersPage from './pages/supervisor/MyPractitionersPage';
import PractitionerAttentionsPage from './pages/supervisor/PractitionerAttentionsPage';
import AttentionAuditPage from './pages/supervisor/AttentionAuditPage';
import FeedbackDashboardPage from './pages/supervisor/FeedbackDashboardPage';

function App() {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

function AppRoutes() {
  useProfileSync();

  return (
    <Routes>
      {/* Public Routes with Header */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register/patient" element={<RegisterPatientPage />} />
      </Route>

      {/* Auth Routes without Header/Footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/practitioner" element={<RegisterPractitionerPage />} />
        <Route path="/register/supervisor" element={<RegisterSupervisorPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Practitioner Dashboard Routes */}
      <Route
        path="/practitioner/*"
        element={
          <ProtectedRoute allowedRoles={['PRACTITIONER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PractitionerDashboardPage />} />
        <Route path="treatments" element={<TreatmentsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="attentions" element={<AttentionsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route
          path="patients/:patientId/attentions/:attentionId/evolution"
          element={<PatientEvolutionPage />}
        />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:sessionId" element={<ChatPage />} />
        <Route path="profile" element={<MyProfilePage />} />
      </Route>

      {/* Patient Dashboard Routes */}
      <Route
        path="/patient/booking-confirmed"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientFeedbackProvider>
              <BookingConfirmationPage />
            </PatientFeedbackProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/*"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientFeedbackProvider>
              <DashboardLayout />
            </PatientFeedbackProvider>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboardPage />} />
        <Route path="treatments" element={<PatientTreatmentsPage />} />
        <Route path="appointments" element={<MyAppointmentsPage />} />
        <Route path="attentions" element={<MyAttentionsPage />} />
        <Route path="feedback" element={<PatientFeedbackPage />} />
        <Route path="chat" element={<PatientChatPage />} />
        <Route path="chat/:sessionId" element={<PatientChatPage />} />
        <Route path="profile" element={<MyProfilePage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="treatments" element={<AdminTreatmentsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="ai-agent" element={<AdminAiAgentPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AiAgentDashboardTab />} />
          <Route path="configuration" element={<AiAgentConfigurationTab />} />
          <Route path="guardrails" element={<AiAgentGuardrailsTab />} />
          <Route path="knowledge-base" element={<AiAgentKnowledgeBaseTab />} />
          <Route path="governance" element={<AiAgentGovernanceTab />} />
          <Route path="history" element={<AiAgentHistoryTab />} />
        </Route>
        <Route path="profile" element={<MyProfilePage />} />
      </Route>

      {/* Supervisor (Docente) Dashboard Routes */}
      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute allowedRoles={['SUPERVISOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SupervisorDashboardPage />} />
        <Route path="practitioners" element={<MyPractitionersPage />} />
        <Route
          path="practitioners/:practitionerId/attentions"
          element={<PractitionerAttentionsPage />}
        />
        <Route
          path="practitioners/:practitionerId/attentions/:attentionId"
          element={<AttentionAuditPage />}
        />
        <Route path="feedback" element={<FeedbackDashboardPage />} />
        <Route path="profile" element={<MyProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
