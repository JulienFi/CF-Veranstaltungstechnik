import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface SharedProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchor = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

function buildClassName({
  variant = 'primary',
  size = 'md',
  className,
  fullWidth = false,
  loading = false,
}: Pick<SharedProps, 'variant' | 'size' | 'className' | 'fullWidth' | 'loading'>): string {
  const parts = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className ?? '',
  ].filter(Boolean);

  return parts.join(' ');
}

export default function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, fullWidth = false, loading = false, ...rest } = props;
  const classNames = buildClassName({ variant, size, className, fullWidth, loading });

  if ('href' in props && props.href) {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classNames} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={classNames} disabled={buttonProps.disabled || loading} {...buttonProps}>
      {children}
    </button>
  );
}
