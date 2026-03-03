"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Scroll animation wrapper ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Feature card with hover state ─── */
export function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all h-full cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 transition-colors ${
          hovered
            ? "bg-blue-600/20 text-blue-400"
            : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Smooth scroll for anchor links ─── */
export function SmoothScrollHandler() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor?.hash) {
        const el = document.querySelector(anchor.hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return null;
}

/* ─── Animated gradient background ─── */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.12), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124,58,237,0.06), transparent 60%)",
          animation: "drift 20s ease-in-out infinite alternate",
        }}
      />
      <style>{`@keyframes drift { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}
