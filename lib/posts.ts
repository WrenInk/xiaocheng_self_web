import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post, PostFrontmatter, PostMeta } from "./types";

export type { Post, PostFrontmatter, PostMeta, Maturity } from "./types";
export { formatDate } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function readAllRaw(): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const source = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(source);
    const fm = data as PostFrontmatter;
    return {
      slug,
      title: fm.title,
      date: fm.date,
      excerpt: fm.excerpt,
      tags: fm.tags ?? [],
      maturity: fm.maturity,
      cover: fm.cover,
      body: content,
    };
  });
}

export function getAllPosts(): PostMeta[] {
  return readAllRaw()
    .map(({ body, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return readAllRaw().find((p) => p.slug === slug) ?? null;
}
