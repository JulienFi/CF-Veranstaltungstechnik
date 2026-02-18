import styles from './GradientBlobs.module.css';

interface GradientBlobsProps {
  className?: string;
}

export default function GradientBlobs({ className }: GradientBlobsProps) {
  const classes = [styles.blobs, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-hidden="true">
      <span className={[styles.blob, styles.blobPrimary].join(' ')} />
      <span className={[styles.blob, styles.blobAccent].join(' ')} />
      <span className={[styles.blob, styles.blobSecondary].join(' ')} />
    </div>
  );
}
