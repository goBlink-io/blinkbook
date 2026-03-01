export interface NavLink {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  href?: string;
  items: (NavLink | NavGroup)[];
}

export type Navigation = NavGroup[];

export function isNavGroup(item: NavLink | NavGroup): item is NavGroup {
  return "items" in item;
}

export const navigation: Navigation = [
  {
    title: "Documentation",
    href: "/docs",
    items: [
      { title: "Getting Started", href: "/docs/getting-started" },
      { title: "API Reference", href: "/docs/api-reference" },
    ],
  },
];

/** Flatten all navigable links in order */
export function flattenNav(
  nav: Navigation
): NavLink[] {
  const links: NavLink[] = [];
  function walk(items: (NavLink | NavGroup)[]) {
    for (const item of items) {
      if (isNavGroup(item)) {
        if (item.href) links.push({ title: item.title, href: item.href });
        walk(item.items);
      } else {
        links.push(item);
      }
    }
  }
  walk(nav);
  return links;
}
