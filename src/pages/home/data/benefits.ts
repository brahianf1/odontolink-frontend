import type { SvgIconComponent } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

export type BenefitTrack = {
  id: 'patient' | 'practitioner' | 'supervisor';
  role: string;
  icon: SvgIconComponent;
  title: string;
  intro: string;
  points: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const benefits: BenefitTrack[] = [
  {
    id: 'patient',
    role: 'Pacientes',
    icon: PersonIcon,
    title: 'Atención odontológica supervisada, sin laberintos.',
    intro:
      'Encontrá el tratamiento que necesitás y reservalo en línea. Sin grupos de Facebook ni WhatsApp personales.',
    points: [
      'Atención gratuita y supervisada por docentes',
      'Tus datos médicos protegidos por la facultad',
      'Turnos digitales con confirmación inmediata',
      'Sabés quién te atiende y quién supervisa cada paso',
    ],
    ctaLabel: 'Registrarme como paciente',
    ctaHref: '/register/patient',
  },
  {
    id: 'practitioner',
    role: 'Practicantes',
    icon: SchoolIcon,
    title: 'Una agenda real para tus prácticas obligatorias.',
    intro:
      'Publicá los tratamientos que necesitás practicar y recibí pacientes confirmados, no fantasmas de WhatsApp.',
    points: [
      'Agenda organizada y visible para vos y tu docente',
      'Cumplimiento de currícula sin perseguir pacientes',
      'Menos ausentismo gracias a confirmaciones digitales',
      'Feedback pedagógico privado, no ranking público',
    ],
    ctaLabel: 'Registrarme como estudiante',
    ctaHref: '/register/practitioner',
  },
  {
    id: 'supervisor',
    role: 'Docentes / Institución',
    icon: SupervisorAccountIcon,
    title: 'Trazabilidad pedagógica y cumplimiento institucional.',
    intro:
      'Supervisión real de cada atención, métricas académicas y respaldo legal del manejo de datos de salud.',
    points: [
      'Auditoría completa de atenciones y evoluciones',
      'Métricas académicas por practicante y por cohorte',
      'Feedback dirigido — sin exposición pública',
      'Cumplimiento de privacidad de datos de salud',
    ],
    ctaLabel: 'Conocer el panel docente',
    ctaHref: '/login',
  },
];
