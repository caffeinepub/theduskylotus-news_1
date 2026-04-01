import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ArticleCard } from "../components/ArticleCard";
import { useArticleBySlug, usePublishedArticles } from "../hooks/useQueries";
import { simpleMarkdownToHtml } from "../utils/markdown";
import { formatDate } from "../utils/slug";

export function ArticlePage() {
  const { slug } = useParams({ from: "/article/$slug" });
  const { data: article, isLoading } = useArticleBySlug(slug);
  const { data: allArticles } = usePublishedArticles();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied! Ready to share on Instagram.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const moreArticles =
    allArticles?.filter((a) => a.slug !== slug).slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-12">
        <Skeleton className="h-6 w-24 mb-8" data-ocid="article.loading_state" />
        <Skeleton className="h-[400px] w-full mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-[800px] mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-4xl text-wine-darkest mb-4">
          Article Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The story you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link to="/">
          <Button
            variant="outline"
            className="border-wine-DEFAULT text-wine-DEFAULT"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Button>
        </Link>
      </main>
    );
  }

  const imageUrl = article.coverImage.getDirectURL();
  const articleUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main>
      {/* Cover image */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img
          src={imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wine-darkest/90 via-wine-darkest/40 to-transparent" />

        {/* Category + nav */}
        <div className="absolute top-6 left-0 right-0 max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          <Link
            to="/"
            data-ocid="article.link"
            className="flex items-center gap-2 text-cream-DEFAULT/80 hover:text-cream-DEFAULT transition-colors text-sm font-sans"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <span className="category-meta text-wine-vibrant bg-wine-darkest/70 px-3 py-1">
            {article.category.toUpperCase()}
          </span>
        </div>

        {/* Headline overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[800px] mx-auto px-4 pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="editorial-heading text-cream-DEFAULT text-4xl md:text-5xl mb-3"
          >
            {article.title}
          </motion.h1>
          {article.subtitle && (
            <p className="text-cream-DEFAULT/75 text-lg font-serif italic">
              {article.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Article meta + body */}
      <div className="max-w-[800px] mx-auto px-4 py-10">
        {/* Meta bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b-2 border-wine">
          <div className="flex items-center gap-4">
            <span className="category-meta text-muted-foreground text-[0.65rem]">
              {formatDate(article.publishDate)}
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="category-meta text-wine-DEFAULT text-[0.65rem]">
              {article.category.toUpperCase()}
            </span>
          </div>

          {/* Copy link for Instagram */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs font-sans hidden sm:inline">
              {articleUrl}
            </span>
            <Button
              onClick={handleCopyLink}
              data-ocid="article.primary_button"
              size="sm"
              className="bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta text-[0.65rem] tracking-wider flex items-center gap-2"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "COPIED!" : "COPY LINK"}
            </Button>
          </div>
        </div>

        {/* Article body */}
        <div
          className="article-body"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled markdown rendering
          dangerouslySetInnerHTML={{
            __html: simpleMarkdownToHtml(article.body),
          }}
        />

        {/* Bottom copy link CTA */}
        <div className="mt-12 pt-8 border-t-2 border-wine flex flex-col sm:flex-row items-center gap-4 bg-cream-DEFAULT/50 p-6">
          <div>
            <p className="font-serif font-semibold text-wine-darkest text-lg">
              Share this story
            </p>
            <p className="text-sm text-muted-foreground">
              Copy the link below to share on Instagram or other platforms.
            </p>
          </div>
          <Button
            onClick={handleCopyLink}
            data-ocid="article.secondary_button"
            size="lg"
            className="shrink-0 bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-wider"
          >
            {copied ? (
              <Check size={16} className="mr-2" />
            ) : (
              <Copy size={16} className="mr-2" />
            )}
            {copied ? "COPIED!" : "COPY ARTICLE LINK"}
          </Button>
        </div>
      </div>

      {/* More stories */}
      {moreArticles.length > 0 && (
        <section className="wine-band py-12">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="category-meta text-cream-DEFAULT tracking-[0.2em] text-sm">
                MORE STORIES
              </h2>
              <div className="flex-1 h-px bg-cream-DEFAULT/20" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {moreArticles.map((a, i) => (
                <motion.div
                  key={a.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`more.item.${i + 1}`}
                >
                  <ArticleCard article={a} variant="featured" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
