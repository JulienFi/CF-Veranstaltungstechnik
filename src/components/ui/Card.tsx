import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  interactive?: boolean;
  flat?: boolean;
  variant?: 'default' | 'stagePanel';
}

export default function Card({
  children,
  className,
  padded = true,
  interactive = false,
  flat = false,
  variant = 'default',
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    padded ? styles.padded : '',
    interactive ? styles.interactive : '',
    flat ? styles.flat : '',
    variant === 'stagePanel' ? styles.stagePanel : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
