import type { ComponentType, ReactNode } from "react";
import { Callout } from "./callout";
import { CodeTabs } from "./code-tabs";
import { ApiPlayground } from "./api-playground";
import { Mermaid } from "./mermaid";

function heading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  return function Heading({
    children,
    id,
    ...props
  }: {
    children?: ReactNode;
    id?: string;
    [key: string]: unknown;
  }) {
    return (
      <Tag id={id} {...props}>
        {id ? <a href={`#${id}`}>{children}</a> : children}
      </Tag>
    );
  };
}

export const mdxComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  h1: heading(1) as ComponentType<Record<string, unknown>>,
  h2: heading(2) as ComponentType<Record<string, unknown>>,
  h3: heading(3) as ComponentType<Record<string, unknown>>,
  h4: heading(4) as ComponentType<Record<string, unknown>>,
  Callout: Callout as ComponentType<Record<string, unknown>>,
  CodeTabs: CodeTabs as ComponentType<Record<string, unknown>>,
  ApiPlayground: ApiPlayground as unknown as ComponentType<Record<string, unknown>>,
  Mermaid: Mermaid as unknown as ComponentType<Record<string, unknown>>,
};
