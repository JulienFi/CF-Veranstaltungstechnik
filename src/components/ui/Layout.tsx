import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Layout.module.css';

type ContainerSize = 'default' | 'narrow' | 'wide';
type SectionTone = 'default' | 'soft' | 'panel';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: ContainerSize;
}

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  tone?: SectionTone;
}

export function Container({ children, className, size = 'default', ...rest }: ContainerProps) {
  const classes = [
    styles.container,
    size === 'narrow' ? styles.narrow : '',
    size === 'wide' ? styles.wide : '',
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

export function Section({ children, className, tone = 'default', ...rest }: SectionProps) {
  const classes = [styles.section, tone === 'soft' ? styles.soft : '', tone === 'panel' ? styles.panel : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} {...rest}>
      {children}
    </section>
  );
}
