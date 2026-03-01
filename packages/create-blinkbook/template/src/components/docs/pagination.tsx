import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { navigation, flattenNav } from "@/config/navigation";
import { config } from "@/../blinkbook.config";

export function Pagination({ slug }: { slug: string[] }) {
  if (!config.features.pagination) return null;

  const currentHref = "/docs/" + slug.join("/");
  const flat = flattenNav(navigation);
  const idx = flat.findIndex((l) => l.href === currentHref);

  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="flex items-center justify-between mt-16 pt-6 border-t border-border">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <div>
            <div className="text-xs text-muted mb-0.5">Previous</div>
            <div className="font-medium text-foreground">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors text-right"
        >
          <div>
            <div className="text-xs text-muted mb-0.5">Next</div>
            <div className="font-medium text-foreground">{next.title}</div>
          </div>
          <ChevronRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
