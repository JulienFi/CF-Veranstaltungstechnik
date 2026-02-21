import type { PropsWithChildren } from 'react';
import { motion, type MotionProps } from 'framer-motion';

type FadeInProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  viewport?: MotionProps['viewport'];
}>;

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  viewport,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}
