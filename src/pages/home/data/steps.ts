export type Step = {
  number: string;
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    number: '01',
    title: 'Registrate',
    description:
      'Creá tu cuenta como paciente o como estudiante. La institución valida tu rol antes de que veas información sensible.',
  },
  {
    number: '02',
    title: 'Buscá y reservá',
    description:
      'Los pacientes filtran por tratamiento; los estudiantes publican prácticas y horarios. Todo dentro de la plataforma — nada de WhatsApp.',
  },
  {
    number: '03',
    title: 'Atención supervisada',
    description:
      'Llegado el día, el tratamiento se realiza con docente supervisor. Todo queda registrado y trazable.',
  },
];
