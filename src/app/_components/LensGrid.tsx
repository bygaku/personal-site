"use client";

import { useEffect, useRef } from "react";

const LENS = {
  CELL: 46,
  RADIUS: 330,
  AMOUNT: 0.5,
  STEP: 7,
  EASE: 0.12
}

/** 背景のグリッド。カーソル位置を中心にレンズのように歪ませる */
export default function LensGrid({ light }: { light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { CELL, RADIUS, AMOUNT, STEP, EASE } = LENS;

    const LINE = light ? "rgba(60,92,132,0.16)" : "rgba(150,178,214,0.10)";
    const TINT = light
      ? ["rgba(12,74,132,0.95)", "rgba(40,96,150,0.42)"]
      : ["rgba(160,220,255,0.85)", "rgba(140,190,235,0.30)"];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, raf = 0, t = 0;
    let tx = -9999, ty = -9999;   // target (real cursor)
    let cx = -9999, cy = -9999;   // eased position actually drawn
    let pointerSeen = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // radial magnification: f(d) = d * (1 + A(1-u)^2), u = d/R
    // f(R) = R keeps the boundary seamless; monotonic while A < 3, so lines never fold
    const warp = (px: number, py: number): [number, number] => {
      const dx = px - cx, dy = py - cy;
      const d = Math.hypot(dx, dy);
      if (d >= RADIUS || d === 0) return [px, py];
      const k = 1 - d / RADIUS;
      const s = 1 + AMOUNT * k * k;
      return [cx + dx * s, cy + dy * s];
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = LINE;

      const lensOn = cx > -5000;
      ctx.beginPath();

      for (let x = (W % CELL) / 2; x <= W; x += CELL) {
        const dx = x - cx;
        if (!lensOn || Math.abs(dx) >= RADIUS) {
          ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H);
          continue;
        }
        const half = Math.sqrt(RADIUS * RADIUS - dx * dx);
        const y0 = cy - half, y1 = cy + half;
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, Math.max(0, y0));
        ctx.moveTo(x + 0.5, Math.max(0, y0));
        for (let y = y0; y <= y1; y += STEP) {
          const [wx, wy] = warp(x, y);
          ctx.lineTo(wx, wy);
        }
        const [ex, ey] = warp(x, y1);
        ctx.lineTo(ex, ey);
        ctx.lineTo(x + 0.5, Math.min(H, y1));
        ctx.lineTo(x + 0.5, H);
      }

      for (let y = (H % CELL) / 2; y <= H; y += CELL) {
        const dy = y - cy;
        if (!lensOn || Math.abs(dy) >= RADIUS) {
          ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5);
          continue;
        }
        const half = Math.sqrt(RADIUS * RADIUS - dy * dy);
        const x0 = cx - half, x1 = cx + half;
        ctx.moveTo(0, y + 0.5); ctx.lineTo(Math.max(0, x0), y + 0.5);
        ctx.moveTo(Math.max(0, x0), y + 0.5);
        for (let x = x0; x <= x1; x += STEP) {
          const [wx, wy] = warp(x, y);
          ctx.lineTo(wx, wy);
        }
        const [ex, ey] = warp(x1, y);
        ctx.lineTo(ex, ey);
        ctx.lineTo(Math.min(W, x1), y + 0.5);
        ctx.lineTo(W, y + 0.5);
      }
      ctx.stroke();

      if (lensOn) {
        // recolour only the pixels that already carry a line
        const tint = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS);
        tint.addColorStop(0, TINT[0]);
        tint.addColorStop(0.55, TINT[1]);
        tint.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = tint;
        ctx.fillRect(cx - RADIUS, cy - RADIUS, RADIUS * 2, RADIUS * 2);
        ctx.globalCompositeOperation = "source-over";

        if (!light) {
          const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS * 1.3);
          bloom.addColorStop(0, "rgba(90,150,210,0.05)");
          bloom.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = bloom;
          ctx.fillRect(cx - RADIUS * 1.3, cy - RADIUS * 1.3, RADIUS * 2.6, RADIUS * 2.6);
          ctx.globalCompositeOperation = "source-over";
        }
      }
    };

    const tick = () => {
      if (!pointerSeen) {
        t += 0.0042;
        tx = W * (0.5 + 0.3 * Math.sin(t));
        ty = H * (0.5 + 0.26 * Math.sin(t * 1.37 + 1.1));
      }
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) {
        cx = cx < -5000 ? tx : cx + (tx - cx) * EASE;
        cy = cy < -5000 ? ty : cy + (ty - cy) * EASE;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => { pointerSeen = true; tx = e.clientX; ty = e.clientY; };
    const onLeave = () => { pointerSeen = false; };
    const onResize = () => { resize(); draw(); };

    resize();
    if (reduce) {
      draw();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [light]);

  return <canvas ref={canvasRef} className="gf-grid" aria-hidden="true" />;
}
