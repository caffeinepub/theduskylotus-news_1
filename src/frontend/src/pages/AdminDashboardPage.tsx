import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "@tanstack/react-router";
import { Edit, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteArticle,
  useIsAdmin,
  usePendingArticles,
  usePublishedArticles,
  useUpdateArticle,
} from "../hooks/useQueries";
import { formatDate } from "../utils/slug";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: published = [], isLoading: loadingPublished } =
    usePublishedArticles();
  const { data: pending = [], isLoading: loadingPending } =
    usePendingArticles();
  const deleteMutation = useDeleteArticle();
  const updateMutation = useUpdateArticle();
  const { actor } = useActor();

  useEffect(() => {
    if (!identity && !checkingAdmin) {
      navigate({ to: "/admin/login" });
    }
    if (identity && !checkingAdmin && isAdmin === false) {
      navigate({ to: "/admin/login" });
    }
  }, [identity, isAdmin, checkingAdmin, navigate]);

  const allArticles = [
    ...published.map((a) => ({ ...a, published: true })),
    ...pending.map((a) => ({ ...a, published: false })),
  ].sort((a, b) => Number(b.publishDate - a.publishDate));

  const handleDelete = async (slug: string) => {
    try {
      await deleteMutation.mutateAsync(slug);
      toast.success("Article deleted.");
    } catch (_e) {
      toast.error("Failed to delete article.");
    }
  };

  const handleTogglePublish = async (
    slug: string,
    currentlyPublished: boolean,
  ) => {
    if (!actor) return;
    try {
      const article = await actor.getArticleBySlug(slug);
      if (!article) return;
      await updateMutation.mutateAsync({
        slug,
        input: {
          title: article.title,
          subtitle: article.subtitle,
          body: article.body,
          category: article.category,
          slug: article.slug,
          publishDate: article.publishDate,
          coverImage: article.coverImage,
        },
        published: !currentlyPublished,
      });
      toast.success(
        currentlyPublished ? "Article unpublished." : "Article published!",
      );
    } catch {
      toast.error("Failed to update article.");
    }
  };

  if (checkingAdmin || loadingPublished || loadingPending) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="animate-spin text-wine-vibrant" size={40} />
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="editorial-heading text-wine-darkest text-4xl">
            Editorial Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allArticles.length} articles total · {published.length} published ·{" "}
            {pending.length} drafts
          </p>
        </div>
        <Link to="/admin/articles/new">
          <Button
            data-ocid="admin.primary_button"
            className="bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-wider"
          >
            <Plus size={16} className="mr-2" /> NEW ARTICLE
          </Button>
        </Link>
      </div>

      {allArticles.length === 0 ? (
        <div
          className="text-center py-24 border-2 border-dashed border-border"
          data-ocid="admin.empty_state"
        >
          <p className="font-serif text-2xl text-muted-foreground mb-4">
            No articles yet.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Create your first article to get started.
          </p>
          <Link to="/admin/articles/new">
            <Button className="bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT">
              <Plus size={16} className="mr-2" /> Create First Article
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <Table data-ocid="admin.table">
            <TableHeader>
              <TableRow className="bg-wine-darkest text-cream-DEFAULT hover:bg-wine-darkest">
                <TableHead className="text-cream-DEFAULT/80 category-meta text-[0.65rem] tracking-wider">
                  TITLE
                </TableHead>
                <TableHead className="text-cream-DEFAULT/80 category-meta text-[0.65rem] tracking-wider">
                  CATEGORY
                </TableHead>
                <TableHead className="text-cream-DEFAULT/80 category-meta text-[0.65rem] tracking-wider">
                  DATE
                </TableHead>
                <TableHead className="text-cream-DEFAULT/80 category-meta text-[0.65rem] tracking-wider">
                  STATUS
                </TableHead>
                <TableHead className="text-cream-DEFAULT/80 category-meta text-[0.65rem] tracking-wider text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allArticles.map((article, i) => (
                <TableRow
                  key={article.slug}
                  data-ocid={`admin.row.${i + 1}`}
                  className="hover:bg-secondary/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-serif font-semibold text-foreground line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5 font-mono">
                        /{article.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="category-meta text-wine-DEFAULT text-[0.65rem]">
                      {article.category.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(article.publishDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        article.published
                          ? "bg-wine-vibrant/10 text-wine-vibrant border-wine-vibrant/30 category-meta text-[0.6rem]"
                          : "bg-muted text-muted-foreground category-meta text-[0.6rem]"
                      }
                    >
                      {article.published ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleTogglePublish(article.slug, article.published)
                        }
                        data-ocid={`admin.toggle.${i + 1}`}
                        title={article.published ? "Unpublish" : "Publish"}
                        className="text-muted-foreground hover:text-wine-vibrant"
                      >
                        {article.published ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                      <Link
                        to="/admin/articles/edit/$slug"
                        params={{ slug: article.slug }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`admin.edit_button.${i + 1}`}
                          className="text-muted-foreground hover:text-wine-DEFAULT"
                        >
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-ocid={`admin.delete_button.${i + 1}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="admin.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {article.title}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="admin.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.slug)}
                              data-ocid="admin.confirm_button"
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
