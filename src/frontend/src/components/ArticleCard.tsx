import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ArticleSummary } from "../backend";
import { formatDate } from "../utils/slug";

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: "default" | "featured" | "hero";
}

export function ArticleCard({
  article,
  variant = "default",
}: ArticleCardProps) {
  const imageUrl = article.coverImage.getDirectURL();

  if (variant === "hero") {
    return (
      <div className="grid md:grid-cols-2 gap-0">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="category-meta text-wine-vibrant mb-3">
            {article.category.toUpperCase()}
          </span>
          <h1 className="editorial-heading text-cream-DEFAULT text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-cream-DEFAULT/70 text-lg italic font-serif mb-6">
              {article.subtitle}
            </p>
          )}
          <div className="flex items-center gap-3 mb-8">
            <span className="category-meta text-cream-DEFAULT/50 text-[0.65rem]">
              {formatDate(article.publishDate)}
            </span>
          </div>
          <Link
            to="/article/$slug"
            params={{ slug: article.slug }}
            data-ocid="hero.primary_button"
            className="inline-flex items-center gap-2 category-meta text-wine-vibrant hover:text-cream-DEFAULT transition-colors text-sm border border-wine-vibrant hover:bg-wine-vibrant px-6 py-3 w-fit"
          >
            READ THE STORY <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative h-64 md:h-auto overflow-hidden">
          <img
            src={imageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-wine-darkest/30 to-transparent" />
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className="flex flex-col group">
        <div className="overflow-hidden mb-4 aspect-[4/3]">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <span className="category-meta text-wine-vibrant text-[0.65rem] mb-2">
          {article.category.toUpperCase()}
        </span>
        <h3 className="editorial-heading text-cream-DEFAULT text-lg leading-snug mb-2 group-hover:text-wine-vibrant transition-colors">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="text-cream-DEFAULT/60 text-sm line-clamp-2 mb-3">
            {article.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-cream-DEFAULT/10">
          <span className="category-meta text-cream-DEFAULT/40 text-[0.6rem]">
            {formatDate(article.publishDate)}
          </span>
          <Link
            to="/article/$slug"
            params={{ slug: article.slug }}
            className="category-meta text-wine-vibrant hover:underline text-[0.65rem] flex items-center gap-1"
          >
            READ <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <article className="group flex flex-col bg-card border border-border hover:border-wine transition-all duration-300 hover:shadow-editorial overflow-hidden">
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="category-meta text-wine-vibrant text-[0.65rem]">
            {article.category.toUpperCase()}
          </span>
          <span className="text-border text-xs">·</span>
          <span className="category-meta text-muted-foreground text-[0.65rem]">
            {formatDate(article.publishDate)}
          </span>
        </div>
        <h3 className="editorial-heading text-foreground text-xl leading-snug mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
            {article.subtitle}
          </p>
        )}
        <Link
          to="/article/$slug"
          params={{ slug: article.slug }}
          className="category-meta text-wine-vibrant hover:text-wine-darkest transition-colors text-[0.65rem] flex items-center gap-1 mt-auto pt-3 border-t border-border"
        >
          READ STORY <ArrowRight size={10} />
        </Link>
      </div>
    </article>
  );
}
