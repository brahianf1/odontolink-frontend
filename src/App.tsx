import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PatientProfilePage from './pages/patient/PatientProfilePage';
import BookingConfirmationPage from './pages/patient/BookingConfirmationPage';
import { PatientFeedbackProvider } from './features/patient';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTreatmentsPage from './pages/admin/AdminTreatmentsPage';

function App() {
  const { mode } = useThemeStore();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
            <Route path="patients/:patientId/attentions/:attentionId/evolution" element={<PatientEvolutionPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          {/* Patient Dashboard Routes */}
          {/* Booking confirmation page (no dashboard layout) */}
          <Route
            path="/patient/booking-confirmed"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
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
            <Route path="profile" element={<PatientProfilePage />} />
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
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
