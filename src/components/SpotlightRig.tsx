import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './SpotlightRig.module.css';

const LEFT_MIN_DEG = -110;
const LEFT_MAX_DEG = -10;
const RIGHT_MIN_DEG = -170;
const RIGHT_MAX_DEG = -70;
const BEAM_ARTWORK_OFFSET_DEG = 80;
const DEFAULT_LEFT_ANGLE = 24;
const DEFAULT_RIGHT_ANGLE = -42;
const LERP_FACTOR = 0.12;
const POINTER_LERP_FACTOR = 0.2;
const ANCHOR_OFFSET = 60;
const BASE_ALPHA = 0.18;
const BOOST_ALPHA = 0.26;
const BOOST_HOLD_MS = 240;
const IDLE_STOP_MS = 2000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toDegrees(fromX: number, fromY: number, toX: number, toY: number): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function toBeamRotation(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  minDeg: number,
  maxDeg: number
): number {
  const pointerAngleDeg = toDegrees(fromX, fromY, toX, toY);
  const clampedPointerAngle = clamp(pointerAngleDeg, minDeg, maxDeg);
  // Beam artwork points ~80deg above +X at 0deg, so we compensate once with a fixed offset.
  return clampedPointerAngle + BEAM_ARTWORK_OFFSET_DEG;
}

export default function SpotlightRig() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftBeamRef = useRef<HTMLSpanElement>(null);
  const rightBeamRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const viewportRef = useRef({ width: 0, height: 0 });
  const pointerRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });
  const alphaRef = useRef({
    target: BASE_ALPHA,
    current: BASE_ALPHA,
    lastMoveAt: 0,
  });
  const anglesRef = useRef({
    targetLeft: DEFAULT_LEFT_ANGLE,
    currentLeft: DEFAULT_LEFT_ANGLE,
    targetRight: DEFAULT_RIGHT_ANGLE,
    currentRight: DEFAULT_RIGHT_ANGLE,
  });

  const [isTouchFallback, setIsTouchFallback] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const isAutoSweep = isTouchFallback || isReducedMotion;

  const applyBeamAlpha = useCallback((alphaValue: number) => {
    const clampedAlpha = clamp(alphaValue, BASE_ALPHA, 0.32);
    const hazeAlpha = clamp(clampedAlpha * 0.62, 0.1, 0.22);
    const globalHazeAlpha = clamp(clampedAlpha * 0.86, 0.16, 0.3);

    overlayRef.current?.style.setProperty('--beam-alpha', clampedAlpha.toFixed(2));
    overlayRef.current?.style.setProperty('--beam-haze-alpha', hazeAlpha.toFixed(2));
    overlayRef.current?.style.setProperty('--global-haze-alpha', globalHazeAlpha.toFixed(2));
  }, []);

  useEffect(() => {
    const syncLayoutVars = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      viewportRef.current = { width, height };
      const initialX = width * 0.5;
      const initialY = height * 0.35;
      const leftHeadX = ANCHOR_OFFSET;
      const leftHeadY = height - ANCHOR_OFFSET;
      const rightHeadX = width - ANCHOR_OFFSET;
      const rightHeadY = height - ANCHOR_OFFSET;
      const leftInitialAngle = toBeamRotation(leftHeadX, leftHeadY, initialX, initialY, LEFT_MIN_DEG, LEFT_MAX_DEG);
      const rightInitialAngle = toBeamRotation(rightHeadX, rightHeadY, initialX, initialY, RIGHT_MIN_DEG, RIGHT_MAX_DEG);

      pointerRef.current = {
        targetX: initialX,
        targetY: initialY,
        currentX: initialX,
        currentY: initialY,
      };
      alphaRef.current = {
        target: BASE_ALPHA,
        current: BASE_ALPHA,
        lastMoveAt: 0,
      };
      anglesRef.current = {
        targetLeft: leftInitialAngle,
        currentLeft: leftInitialAngle,
        targetRight: rightInitialAngle,
        currentRight: rightInitialAngle,
      };

      const beamLength = Math.hypot(width, height) * 1.2;
      overlayRef.current?.style.setProperty('--beam-length', `${beamLength}px`);
      leftBeamRef.current?.style.setProperty('--spotlight-angle', `${leftInitialAngle.toFixed(2)}deg`);
      rightBeamRef.current?.style.setProperty('--spotlight-angle', `${rightInitialAngle.toFixed(2)}deg`);
      applyBeamAlpha(BASE_ALPHA);
    };

    syncLayoutVars();
    window.addEventListener('resize', syncLayoutVars);
    return () => {
      window.removeEventListener('resize', syncLayoutVars);
    };
  }, [applyBeamAlpha]);

  useEffect(() => {
    const syncDebugMode = () => {
      const params = new URLSearchParams(window.location.search);
      setIsDebugMode(params.get('spotlightDebug') === '1');
    };

    syncDebugMode();
    window.addEventListener('popstate', syncDebugMode);
    return () => {
      window.removeEventListener('popstate', syncDebugMode);
    };
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverFineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const syncMedia = () => {
      setIsReducedMotion(reducedMotionQuery.matches);
      setIsTouchFallback(!hoverFineQuery.matches);
    };

    syncMedia();
    reducedMotionQuery.addEventListener('change', syncMedia);
    hoverFineQuery.addEventListener('change', syncMedia);

    return () => {
      reducedMotionQuery.removeEventListener('change', syncMedia);
      hoverFineQuery.removeEventListener('change', syncMedia);
    };
  }, []);

  useEffect(() => {
    if (isAutoSweep) {
      leftBeamRef.current?.style.setProperty('--spotlight-angle', `${DEFAULT_LEFT_ANGLE}deg`);
      rightBeamRef.current?.style.setProperty('--spotlight-angle', `${DEFAULT_RIGHT_ANGLE}deg`);
      applyBeamAlpha(BASE_ALPHA);
      return;
    }

    const animate = () => {
      const { width, height } = viewportRef.current;
      const leftHeadX = ANCHOR_OFFSET;
      const leftHeadY = height - ANCHOR_OFFSET;
      const rightHeadX = width - ANCHOR_OFFSET;
      const rightHeadY = height - ANCHOR_OFFSET;
      const now = performance.now();
      const idleForMs = now - alphaRef.current.lastMoveAt;
      if (idleForMs > BOOST_HOLD_MS) {
        alphaRef.current.target = BASE_ALPHA;
      }
      alphaRef.current.current += (alphaRef.current.target - alphaRef.current.current) * LERP_FACTOR;
      applyBeamAlpha(alphaRef.current.current);

      pointerRef.current.currentX += (pointerRef.current.targetX - pointerRef.current.currentX) * POINTER_LERP_FACTOR;
      pointerRef.current.currentY += (pointerRef.current.targetY - pointerRef.current.currentY) * POINTER_LERP_FACTOR;
      const { currentX, currentY } = pointerRef.current;
      const pointerDelta = Math.hypot(pointerRef.current.targetX - currentX, pointerRef.current.targetY - currentY);

      const leftTarget = toBeamRotation(leftHeadX, leftHeadY, currentX, currentY, LEFT_MIN_DEG, LEFT_MAX_DEG);
      const rightTarget = toBeamRotation(rightHeadX, rightHeadY, currentX, currentY, RIGHT_MIN_DEG, RIGHT_MAX_DEG);

      anglesRef.current.targetLeft = leftTarget;
      anglesRef.current.targetRight = rightTarget;
      anglesRef.current.currentLeft += (anglesRef.current.targetLeft - anglesRef.current.currentLeft) * LERP_FACTOR;
      anglesRef.current.currentRight += (anglesRef.current.targetRight - anglesRef.current.currentRight) * LERP_FACTOR;

      leftBeamRef.current?.style.setProperty('--spotlight-angle', `${anglesRef.current.currentLeft.toFixed(2)}deg`);
      rightBeamRef.current?.style.setProperty('--spotlight-angle', `${anglesRef.current.currentRight.toFixed(2)}deg`);

      const alphaDelta = Math.abs(alphaRef.current.target - alphaRef.current.current);
      const leftDelta = Math.abs(anglesRef.current.targetLeft - anglesRef.current.currentLeft);
      const rightDelta = Math.abs(anglesRef.current.targetRight - anglesRef.current.currentRight);

      const shouldKeepRunning =
        idleForMs < IDLE_STOP_MS ||
        pointerDelta > 0.5 ||
        alphaDelta > 0.005 ||
        leftDelta > 0.1 ||
        rightDelta > 0.1;

      if (shouldKeepRunning) {
        rafRef.current = window.requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    const ensureRunning = () => {
      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.targetX = event.clientX;
      pointerRef.current.targetY = event.clientY;
      alphaRef.current.target = BOOST_ALPHA;
      alphaRef.current.lastMoveAt = performance.now();
      ensureRunning();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        return;
      }

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [applyBeamAlpha, isAutoSweep]);

  const className = [
    styles.overlay,
    isAutoSweep ? styles.autoSweep : '',
    isReducedMotion ? styles.reducedMotion : '',
    isDebugMode ? styles.debugMode : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={overlayRef} className={className} aria-hidden="true">
      <span className={styles.globalHaze} />
      <span ref={leftBeamRef} className={[styles.beamWrap, styles.leftBeamWrap].join(' ')}>
        <span className={styles.beamCore} />
        <span className={styles.beamHaze} />
      </span>
      <span ref={rightBeamRef} className={[styles.beamWrap, styles.rightBeamWrap].join(' ')}>
        <span className={styles.beamCore} />
        <span className={styles.beamHaze} />
      </span>
      <span className={[styles.fixture, styles.leftFixture].join(' ')} />
      <span className={[styles.fixture, styles.rightFixture].join(' ')} />
    </div>
  );
}
