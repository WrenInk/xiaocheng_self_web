import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { getPostBySlug } from "./posts";

// Module-level cache. In dev, survives across requests in the same Node
// process, so /blog only pays the compile cost on the first hit.
const htmlCache = new Map<string, string>();

// Shiki theme tuned for the cream/warm-Claude palette.
const PRETTY_CODE_OPTIONS = {
  theme: "github-light",
  keepBackground: false, // we provide our own pre background in CSS
  defaultLang: "plaintext",
} as const;

async function compile(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePrettyCode, PRETTY_CODE_OPTIONS)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

export async function getPostHtml(slug: string): Promise<string> {
  const cached = htmlCache.get(slug);
  if (cached) return cached;
  const post = getPostBySlug(slug);
  if (!post) return "";
  const html = await compile(post.body);
  htmlCache.set(slug, html);
  return html;
}
