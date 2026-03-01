import Link from "next/link";
import { ChevronRight } from "lucide-react";

function capitalize(s: string) {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs({ slug }: { slug: string[] }) {
  const crumbs = slug.map((segment, i) => ({
    label: capitalize(segment),
    href: "/docs/" + slug.slice(0, i + 1).join("/"),
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-muted mb-6">
      <Link href="/docs" className="hover:text-foreground transition-colors">
        Docs
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight size={12} />
          <Link
            href={crumb.href}
            className="hover:text-foreground transition-colors"
          >
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
