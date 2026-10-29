"use client";
import { useEffect, useRef } from "react";

type Point = { x: number; y: number; r: number; speed: number; phase: number };

export function KazakhSkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    const points: Point[] = Array.from({ length: 34 }, (_, index) => ({
      x: (index * 83) % 1000 / 1000,
      y: (index * 137) % 800 / 800,
      r: 1 + (index % 3) * 0.55,
      speed: 0.12 + (index % 5) * 0.025,
      phase: index * 0.73,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      pointerY = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    };
    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const cx = width * 0.79 + pointerX * 18;
      const cy = height * 0.41 + pointerY * 14;
      const radius = Math.min(width, height) * 0.125;
      context.save();
      context.translate(cx, cy);
      context.rotate(time * 0.000025);
      context.strokeStyle = "rgba(246,196,69,0.58)";
      context.lineWidth = 1.2;
      for (let i = 0; i < 24; i += 1) {
        const angle = (Math.PI * 2 * i) / 24;
        const pulse = Math.sin(time * 0.001 + i) * 4;
        context.beginPath();
        context.moveTo(Math.cos(angle) * (radius + 15), Math.sin(angle) * (radius + 15));
        context.lineTo(Math.cos(angle) * (radius + 54 + pulse), Math.sin(angle) * (radius + 54 + pulse));
        context.stroke();
      }
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(246,196,69,0.16)";
      context.fill();
      context.strokeStyle = "rgba(246,196,69,0.92)";
      context.lineWidth = 2;
      context.stroke();
      context.restore();

      points.forEach((point) => {
        const y = (point.y * height + time * point.speed * 0.01) % height;
        const alpha = 0.24 + Math.sin(time * 0.001 + point.phase) * 0.12;
        context.beginPath();
        context.arc(point.x * width + pointerX * 7, y, point.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,255,255,${alpha})`;
        context.fill();
      });

      context.strokeStyle = "rgba(246,196,69,0.22)";
      context.lineWidth = 1;
      const baseY = height * 0.79;
      for (let x = width * 0.54; x < width + 80; x += 42) {
        context.beginPath();
        context.moveTo(x + pointerX * 8, baseY);
        context.lineTo(x + 21 + pointerX * 8, baseY - 21);
        context.lineTo(x + 42 + pointerX * 8, baseY);
        context.lineTo(x + 21 + pointerX * 8, baseY + 21);
        context.closePath();
        context.stroke();
      }
      frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas ref={canvasRef} className="kazakh-sky-canvas" aria-hidden="true" />;
}
