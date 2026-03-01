import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compile, run, type RunOptions } from "@mdx-js/mdx";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { ComponentType } from "react";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

export interface Frontmatter {
  title: string;
  description: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface DocPage {
  frontmatter: Frontmatter;
  Content: ComponentType<{ components?: Record<string, ComponentType> }>;
  headings: Heading[];
}

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  content: string;
}

function extractHeadings(source: string): Heading[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = headingRegex.exec(source)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export async function getDocBySlug(
  slug: string[]
): Promise<DocPage | null> {
  const candidates = [
    path.join(CONTENT_DIR, ...slug) + ".mdx",
    path.join(CONTENT_DIR, ...slug, "index.mdx"),
  ];

  let filePath: string | null = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;
  const headings = extractHeadings(content);

  const compiled = String(
    await compile(content, {
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: "github-dark-default",
            keepBackground: true,
          },
        ],
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ],
    })
  );

  const mod = await run(compiled, {
    Fragment,
    jsx,
    jsxs,
    baseUrl: import.meta.url,
  } as RunOptions);

  return {
    frontmatter,
    Content: mod.default as DocPage["Content"],
    headings,
  };
}

export function getAllSlugs(): string[][] {
  const slugs: string[][] = [];

  function walk(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name]);
      } else if (entry.name.endsWith(".mdx")) {
        const name = entry.name.replace(".mdx", "");
        if (name === "index") {
          if (prefix.length > 0) slugs.push(prefix);
        } else {
          slugs.push([...prefix, name]);
        }
      }
    }
  }

  walk(CONTENT_DIR);
  return slugs;
}

export function getAllSearchData(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  function walk(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        walk(path.join(dir, item.name), [...prefix, item.name]);
      } else if (item.name.endsWith(".mdx")) {
        const raw = fs.readFileSync(path.join(dir, item.name), "utf-8");
        const { data, content } = matter(raw);
        const name = item.name.replace(".mdx", "");
        const slug =
          name === "index"
            ? prefix.length > 0
              ? prefix
              : []
            : [...prefix, name];
        if (slug.length === 0) return;
        entries.push({
          title: (data as Frontmatter).title || name,
          description: (data as Frontmatter).description || "",
          href: "/docs/" + slug.join("/"),
          content: content
            .replace(/```[\s\S]*?```/g, "")
            .replace(/[#*`\[\]()>|-]/g, " ")
            .replace(/\s+/g, " ")
            .slice(0, 500),
        });
      }
    }
  }

  walk(CONTENT_DIR);
  return entries;
}
