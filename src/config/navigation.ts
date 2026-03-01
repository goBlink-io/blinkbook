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
    title: "Users",
    href: "/docs/users",
    items: [
      { title: "Getting Started", href: "/docs/users/getting-started" },
      {
        title: "How Transfers Work",
        href: "/docs/users/how-transfers-work",
      },
      { title: "Supported Chains & Tokens", href: "/docs/users/supported-chains" },
      { title: "Payment Links", href: "/docs/users/payment-links" },
      { title: "Telegram Bot", href: "/docs/users/telegram-bot" },
      {
        title: "Merchant",
        items: [
          { title: "Onboarding", href: "/docs/users/merchant/onboarding" },
          {
            title: "Dashboard Tour",
            href: "/docs/users/merchant/dashboard-tour",
          },
          { title: "Settlement", href: "/docs/users/merchant/settlement" },
          { title: "Test Mode", href: "/docs/users/merchant/test-mode" },
          {
            title: "Invoices & POS",
            href: "/docs/users/merchant/invoices-pos",
          },
          {
            title: "Troubleshooting",
            href: "/docs/users/merchant/troubleshooting",
          },
        ],
      },
    ],
  },
  {
    title: "Developers",
    href: "/docs/developers",
    items: [
      { title: "Quickstart", href: "/docs/developers/quickstart" },
      { title: "Authentication", href: "/docs/developers/authentication" },
      { title: "Payments API", href: "/docs/developers/payments-api" },
      { title: "Webhooks", href: "/docs/developers/webhooks" },
      { title: "Invoices API", href: "/docs/developers/invoices-api" },
      { title: "Checkout", href: "/docs/developers/checkout" },
      {
        title: "Embeddable Button",
        href: "/docs/developers/embeddable-button",
      },
      { title: "SDK Reference", href: "/docs/developers/sdk" },
      { title: "Error Codes", href: "/docs/developers/error-codes" },
      { title: "Changelog", href: "/docs/developers/changelog" },
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
