import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeTone = 'accent' | 'neutral' | 'warm';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

export default function Badge({ children, tone = 'neutral', className, ...rest }: BadgeProps) {
  const classes = [styles.badge, styles[tone], className ?? ''].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
