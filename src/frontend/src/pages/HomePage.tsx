import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useState } from "react";
import { ArticleCard } from "../components/ArticleCard";
import { usePublishedArticles } from "../hooks/useQueries";

const CATEGORIES = [
  "All",
  "Politics",
  "World",
  "Culture",
  "Voices",
  "The Arts",
  "Design",
];

const SAMPLE_ARTICLES = [
  {
    slug: "the-red-thread-of-history",
    title:
      "The Red Thread of History: How Ancient Trade Routes Shaped Modern Politics",
    subtitle:
      "A deep dive into how the silk roads of antiquity continue to influence contemporary geopolitics and global diplomacy.",
    category: "World",
    publishDate: BigInt(1743500000000000000),
    coverImage: {
      getDirectURL: () =>
        "/assets/generated/article-world-affairs.dim_800x500.jpg",
    } as any,
  },
  {
    slug: "voices-of-the-unheard",
    title: "Voices of the Unheard: Artists Reclaiming Cultural Narratives",
    subtitle:
      "Inside the movement of independent artists pushing back against mainstream cultural erasure through radical self-expression.",
    category: "Culture",
    publishDate: BigInt(1743200000000000000),
    coverImage: {
      getDirectURL: () =>
        "/assets/generated/article-culture-arts.dim_800x500.jpg",
    } as any,
  },
  {
    slug: "design-in-the-age-of-crisis",
    title: "Design in the Age of Crisis: When Aesthetics Become Political",
    subtitle:
      "How contemporary designers are weaponizing beauty and visual language to speak truth to power.",
    category: "Design",
    publishDate: BigInt(1742900000000000000),
    coverImage: {
      getDirectURL: () =>
        "/assets/generated/article-design-voices.dim_800x500.jpg",
    } as any,
  },
  {
    slug: "the-lotus-effect",
    title: "The Lotus Effect: Rising From the Murky Waters of Modern Discourse",
    subtitle:
      "A philosophical meditation on clarity, purity of thought, and the ancient symbolism of the lotus in contemporary life.",
    category: "Voices",
    publishDate: BigInt(1742600000000000000),
    coverImage: {
      getDirectURL: () =>
        "/assets/generated/hero-lotus-politics.dim_1200x700.jpg",
    } as any,
  },
];

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: articles, isLoading } = usePublishedArticles();

  const displayArticles =
    articles && articles.length > 0 ? articles : SAMPLE_ARTICLES;
  const heroArticle = displayArticles[0];
  const featureArticles = displayArticles.slice(1, 5);
  const filteredArticles =
    activeCategory === "All"
      ? displayArticles.slice(1)
      : displayArticles.filter((a) => a.category === activeCategory).slice(1);

  return (
    <main>
      {/* Hero Section */}
      <section className="dark-band">
        <div className="max-w-[1200px] mx-auto">
          {isLoading ? (
            <div
              className="grid md:grid-cols-2 gap-0 p-8"
              data-ocid="homepage.loading_state"
            >
              <div className="space-y-4">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-16 w-full bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
              <Skeleton className="h-64 bg-white/10" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ArticleCard article={heroArticle as any} variant="hero" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Features & Perspectives Band */}
      <section className="wine-band py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="category-meta text-cream-DEFAULT tracking-[0.2em] text-sm">
              FEATURES &amp; PERSPECTIVES
            </h2>
            <div className="flex-1 h-px bg-cream-DEFAULT/20" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              ["sk1", "sk2", "sk3", "sk4"].map((k) => (
                <div key={k} className="space-y-3">
                  <Skeleton className="h-40 w-full bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-3 w-3/4 bg-white/10" />
                </div>
              ))
            ) : featureArticles.length > 0 ? (
              featureArticles.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`features.item.${i + 1}`}
                >
                  <ArticleCard article={article as any} variant="featured" />
                </motion.div>
              ))
            ) : (
              <div
                className="col-span-4 text-center py-8 text-cream-DEFAULT/50"
                data-ocid="features.empty_state"
              >
                <p className="font-serif italic text-lg">
                  More stories coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Stories – light band */}
      <section className="py-12 bg-background">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Category filter tabs */}
          <div className="flex items-center gap-0 mb-8 border-b-2 border-wine overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-ocid="articles.tab"
                className={`category-meta px-4 py-2 text-[0.65rem] tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-wine-vibrant text-wine-vibrant -mb-0.5"
                    : "border-transparent text-wine-dark hover:text-wine-vibrant"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <h2 className="category-meta text-foreground tracking-[0.2em] text-sm">
              LATEST STORIES
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["a", "b", "c", "d", "e", "f"].map((k) => (
                <div key={k} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  data-ocid={`articles.item.${i + 1}`}
                >
                  <ArticleCard article={article as any} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="articles.empty_state"
            >
              <p className="font-serif italic text-xl mb-2">
                No articles in this category yet.
              </p>
              <p className="text-sm">Check back soon for new stories.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
