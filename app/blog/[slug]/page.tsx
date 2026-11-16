import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug, formatDate } from "@/lib/blog";

const SITE_URL = "https://www.poweredbymicah.com";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date ? post.date.toISOString() : undefined,
      authors: [post.author],
      images: ["/og-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const dateLabel = formatDate(post.date);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date ? post.date.toISOString() : undefined,
    dateModified: post.date ? post.date.toISOString() : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    image: `${SITE_URL}/og-image.jpg`,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: "Owner and Licensed Electrician",
      worksFor: { "@type": "Organization", name: "Powered Up LLC" },
    },
    publisher: {
      "@type": "Organization",
      name: "Powered Up LLC",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };

  return (
    <article className="post">
      <div className="post-wrap">
        <Link href="/blog" className="post-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Posts
        </Link>

        {dateLabel && <div className="post-meta">{dateLabel}</div>}
        <h1 className="post-title">{post.title}</h1>
        {post.description && <p className="post-lead">{post.description}</p>}

        <div className="prose prose-invert prose-brand">
          <MDXRemote source={post.content.replace(/^\s*#[ \t]+[^\r\n]*(?:\r?\n)+/, "")} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
