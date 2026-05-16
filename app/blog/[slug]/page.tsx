import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { getPostHtml } from "@/lib/markdown";
import { BlogDrum } from "@/components/BlogDrum";

type Params = { slug: string };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Notes`,
    description: post.excerpt,
  };
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const entries = await Promise.all(
    posts.map(async (p) => [p.slug, await getPostHtml(p.slug)] as const)
  );
  const bodies: Record<string, string> = Object.fromEntries(entries);

  return <BlogDrum posts={posts} bodies={bodies} initialSlug={slug} />;
}
