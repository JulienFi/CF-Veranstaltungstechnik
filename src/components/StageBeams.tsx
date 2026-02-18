import styles from './StageBeams.module.css';

interface StageBeamsProps {
  className?: string;
}

export default function StageBeams({ className }: StageBeamsProps) {
  const classes = [styles.beams, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-hidden="true">
      <span className={[styles.beam, styles.beamA].join(' ')} />
      <span className={[styles.beam, styles.beamB].join(' ')} />
      <span className={[styles.beam, styles.beamC].join(' ')} />
      <span className={styles.grain} />
    </div>
  );
}
