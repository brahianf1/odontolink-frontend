export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: '¿Cuánto cuesta usar OdontoLink?',
    answer:
      'Es totalmente gratuito. OdontoLink es un proyecto institucional de la Facultad de Odontología de la UNT — no es un servicio comercial.',
  },
  {
    question: '¿Es seguro entregar mis datos médicos?',
    answer:
      'Sí. Tus datos se almacenan únicamente dentro de OdontoLink, con acceso restringido al practicante asignado y a su docente supervisor. Reemplazamos por completo el uso informal de WhatsApp y Facebook.',
  },
  {
    question: '¿Quién me atiende? ¿Están supervisados?',
    answer:
      'Te atiende un estudiante avanzado de la carrera de Odontología, siempre supervisado por un docente de la FOUNT. Cada atención queda registrada y auditada.',
  },
  {
    question: '¿Qué tratamientos están disponibles?',
    answer:
      'Los que los estudiantes deben practicar según currícula: limpieza, conducto, obturación, extracciones simples, prótesis y otros. Cada estudiante publica el tratamiento específico que necesita realizar.',
  },
  {
    question: '¿Cómo cancelo o reprogramo un turno?',
    answer:
      'Desde tu panel personal, hasta 24 horas antes del turno. La comunicación adicional con tu practicante se hace por el chat interno de la plataforma.',
  },
  {
    question: 'Soy estudiante de Odontología, ¿cómo me sumo?',
    answer:
      'Registrate como estudiante, configurá tu disponibilidad y los tratamientos que necesitás practicar. Un docente valida tu perfil antes de que aparezcas en las búsquedas de los pacientes.',
  },
  {
    question: '¿Hay app móvil o solo web?',
    answer:
      'Por ahora la plataforma es web responsive. Funciona sin instalar nada desde el navegador del celular.',
  },
  {
    question: '¿Qué pasa si tengo un problema durante el tratamiento?',
    answer:
      'Tu docente supervisor interviene siempre que sea necesario, y podés reportar incidentes desde el chat interno o desde tu panel de paciente.',
  },
];
