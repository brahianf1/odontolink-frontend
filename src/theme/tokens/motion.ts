export const duration = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
  extraLong1: 700,
  extraLong2: 800,
  extraLong3: 900,
  extraLong4: 1000,
} as const;

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  legacy: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const easingArray = {
  standard: [0.2, 0, 0, 1] as const,
  standardAccelerate: [0.3, 0, 1, 1] as const,
  standardDecelerate: [0, 0, 0, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as const,
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as const,
} as const;

export const motion = {
  duration,
  easing,
  easingArray,
} as const;

export type Motion = typeof motion;
