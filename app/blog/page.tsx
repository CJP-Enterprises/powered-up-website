import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: { absolute: "Blog | Powered Up LLC" },
  description:
    "Electrical tips, project notes, and guidance from Powered Up LLC — a licensed, owner-operated electrician serving Taunton and the South Shore.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Powered Up LLC",
    description:
      "Electrical tips, project notes, and guidance from Powered Up LLC — Taunton & the South Shore.",
    type: "website",
    url: "https://www.poweredbymicah.com/blog",
    images: ["/og-image.jpg"],
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">From the Field</div>
          <h1>
            Notes from <em>the panel</em>.
          </h1>
          <p>
            Practical electrical guidance, project write-ups, and answers to the questions
            homeowners across the South Shore ask most.
          </p>
        </div>
      </section>

      <section className="blog">
        <div className="wrap">
          {posts.length === 0 ? (
            <div className="blog-empty">
              No posts yet — check back soon. In the meantime, give Micah a call at (508) 622-5919.
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => {
                const dateLabel = formatDate(post.date);
                return (
                  <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                    {dateLabel && <div className="blog-card-date">{dateLabel}</div>}
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.description}</p>
                    <span className="blog-card-more">
                      Read more
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
