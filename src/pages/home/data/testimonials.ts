export type Testimonial = {
  initials: string;
  name: string;
  role: string;
  quote: string;
  context: string;
};

export const testimonials: Testimonial[] = [
  {
    initials: 'MR',
    name: 'María Rodríguez',
    role: 'Paciente FOUNT',
    context: '42 años · Tratamiento de conducto',
    quote:
      'No tuve que mandar mis datos por WhatsApp ni explicarle cinco veces lo que necesitaba. Reservé el turno, vi quién me iba a atender y qué docente lo supervisaba antes de pisar la facultad.',
  },
  {
    initials: 'LO',
    name: 'Lucas Ortiz',
    role: 'Estudiante de Odontología',
    context: '4° año · UNT',
    quote:
      'Antes pasaba horas mandando mensajes y publicando en grupos de Facebook. Ahora los pacientes vienen confirmados y mi docente puede ver mi evolución sin que tenga que mandarle capturas.',
  },
];
