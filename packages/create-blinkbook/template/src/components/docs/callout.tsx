import { Info, AlertTriangle, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

const variants = {
  info: {
    icon: Info,
    bg: "bg-blue-500/5",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    title: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/5",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    title: "Warning",
  },
  danger: {
    icon: AlertCircle,
    bg: "bg-red-500/5",
    border: "border-red-500/30",
    iconColor: "text-red-400",
    title: "Danger",
  },
};

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const v = variants[type];
  const Icon = v.icon;

  return (
    <div
      className={`my-6 flex gap-3 rounded-lg border-l-4 ${v.border} ${v.bg} p-4`}
    >
      <Icon size={18} className={`${v.iconColor} mt-0.5 shrink-0`} />
      <div className="text-sm leading-relaxed">
        {(title || v.title) && (
          <div className="font-semibold mb-1">{title || v.title}</div>
        )}
        <div className="text-zinc-300">{children}</div>
      </div>
    </div>
  );
}
