/**
 * View Transitions API helper for smooth theme-mode toggles.
 *
 * Uses `document.startViewTransition` (Chrome 111+, Edge 111+, Safari 18+)
 * and animates a circular clip-path reveal from the click origin. Falls back
 * to the bare action call on older browsers or when the user prefers
 * reduced motion — `action` is always invoked exactly once.
 */

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const supportsViewTransitions = (): boolean =>
  typeof document !== 'undefined' &&
  typeof (document as ViewTransitionDocument).startViewTransition === 'function';

export interface RevealOrigin {
  x: number;
  y: number;
}

export const withViewTransition = (action: () => void, origin?: RevealOrigin): void => {
  if (typeof document === 'undefined') {
    action();
    return;
  }
  if (prefersReducedMotion() || !supportsViewTransitions()) {
    action();
    return;
  }
  const doc = document as ViewTransitionDocument;
  const transition = doc.startViewTransition!(action);
  if (!origin) return;
  transition.ready
    .then(() => {
      const { x, y } = origin;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      // Transition cancelled or never ready; nothing to do.
    });
};

/** Convenience helper to extract the centre of a click target as RevealOrigin. */
export const originFromEvent = (
  event: { currentTarget: { getBoundingClientRect: () => DOMRect } } | null | undefined,
): RevealOrigin | undefined => {
  if (!event) return undefined;
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};
