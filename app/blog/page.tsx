import { getAllPosts } from "@/lib/posts";
import { getPostHtml } from "@/lib/markdown";
import { BlogDrum } from "@/components/BlogDrum";

export const metadata = {
  title: "Blog — Notes & Garden",
};

export default async function BlogPage() {
  const posts = getAllPosts();
  const entries = await Promise.all(
    posts.map(async (p) => [p.slug, await getPostHtml(p.slug)] as const)
  );
  const bodies: Record<string, string> = Object.fromEntries(entries);
  return <BlogDrum posts={posts} bodies={bodies} />;
}
