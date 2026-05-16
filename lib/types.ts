export type Maturity = "seedling" | "budding" | "evergreen";

export type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  maturity: Maturity;
  cover?: string;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
};

export type Post = PostMeta & {
  body: string;
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
