"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  navigation,
  isNavGroup,
  type NavLink,
  type NavGroup,
} from "@/config/navigation";

function NavItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`block py-1.5 px-3 rounded-md text-sm transition-colors ${
        active
          ? "bg-accent-blue/10 text-accent-blue font-medium"
          : "text-muted hover:text-foreground hover:bg-surface"
      }`}
    >
      {item.title}
    </Link>
  );
}

function NavSection({
  group,
  depth = 0,
}: {
  group: NavGroup;
  depth?: number;
}) {
  const pathname = usePathname();
  const isActive = hasActiveChild(group, pathname);
  const [open, setOpen] = useState(isActive);

  return (
    <div className={depth > 0 ? "ml-3 mt-1" : ""}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full gap-1 py-1.5 px-3 text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
      >
        <ChevronRight
          size={14}
          className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}
        />
        {group.title}
      </button>
      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          {group.items.map((item) =>
            isNavGroup(item) ? (
              <NavSection key={item.title} group={item} depth={depth + 1} />
            ) : (
              <NavItem key={item.href} item={item} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function hasActiveChild(group: NavGroup, pathname: string): boolean {
  return group.items.some((item) => {
    if (isNavGroup(item)) return hasActiveChild(item, pathname);
    return item.href === pathname;
  });
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 bottom-0 z-40 w-64 border-r border-border bg-background overflow-y-auto transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
          {navigation.map((group) => (
            <NavSection key={group.title} group={group} />
          ))}
        </nav>
      </aside>
    </>
  );
}
