import styles from './Skeleton.module.css';

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export function Skeleton({ height = '1rem', width = '100%', className }: SkeletonProps) {
  return <span className={[styles.skeleton, className ?? ''].filter(Boolean).join(' ')} style={{ height, width }} aria-hidden="true" />;
}

export function InlineSpinner({ className }: { className?: string }) {
  return <span className={[styles.spinner, className ?? ''].filter(Boolean).join(' ')} aria-hidden="true" />;
}
