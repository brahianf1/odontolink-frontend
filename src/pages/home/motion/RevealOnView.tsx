import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, stagger } from './variants';

type RevealOnViewProps = {
  children: ReactNode;
  variants?: Variants;
  childVariants?: Variants;
  staggerChildren?: number;
  delayChildren?: number;
  amount?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const RevealOnView = ({
  children,
  variants,
  childVariants,
  staggerChildren = 0.08,
  delayChildren = 0,
  amount = 0.25,
  once = true,
  className,
  style,
}: RevealOnViewProps) => {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = variants ?? stagger(staggerChildren, delayChildren);
  const itemVariants = childVariants ?? fadeUp;

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <motion.div key={i} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
};

export default RevealOnView;
