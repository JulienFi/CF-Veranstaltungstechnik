import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mediaReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const reduceMotion = !!mediaReduce?.matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      w = Math.max(1, Math.floor(window.innerWidth));
      h = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / w;
      pointer.ty = e.clientY / h;
    };

    const blobs = Array.from({ length: 5 }).map(() => ({
      a: Math.random() * Math.PI * 2,
      s: 0.0005 + Math.random() * 0.0008,
      r: 220 + Math.random() * 260,
      ox: Math.random(),
      oy: Math.random(),
    }));

    const drawFrame = (orbitStrength: number, pointerStrength: number, animate: boolean) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(90px)";

      for (const b of blobs) {
        if (animate) {
          b.a += b.s * 24;
        }

        const x =
          (b.ox +
            orbitStrength * Math.cos(b.a) +
            pointerStrength * (pointer.x - 0.5)) *
          w;
        const y =
          (b.oy +
            orbitStrength * Math.sin(b.a * 1.25) +
            pointerStrength * (pointer.y - 0.5)) *
          h;

        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, "rgba(120, 200, 255, 0.22)");
        g.addColorStop(0.5, "rgba(180, 120, 255, 0.16)");
        g.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    const renderOnce = () => {
      drawFrame(0, 0.09, false);
    };

    const loop = () => {
      // smooth pointer
      pointer.x += (pointer.tx - pointer.x) * 0.02;
      pointer.y += (pointer.ty - pointer.y) * 0.02;

      drawFrame(0.06, 0.08, true);
      raf = requestAnimationFrame(loop);
    };

    const startAnimation = () => {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    };

    const stopAnimation = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      raf = 0;
    };

    resize();

    if (reduceMotion) {
      // still: render one frame only (no animation)
      renderOnce();
    } else {
      startAnimation();
    }

    window.addEventListener("resize", resize);

    const onReduceChange = () => {
      // If user toggles reduce-motion during runtime: simplest = reload render
      if (mediaReduce?.matches) {
        stopAnimation();
        renderOnce();
      } else if (!raf) {
        startAnimation();
      }
    };
    mediaReduce?.addEventListener?.("change", onReduceChange);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resize);
      mediaReduce?.removeEventListener?.("change", onReduceChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)",
        maskImage:
          "linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)",
      }}
    >
      <canvas ref={ref} />
    </div>
  );
}
