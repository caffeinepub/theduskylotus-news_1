import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article, ArticleInput, ArticleSummary } from "../backend";
import { UserRole } from "../backend";
import { useActor } from "./useActor";

export function usePublishedArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<ArticleSummary[]>({
    queryKey: ["publishedArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<ArticleSummary[]>({
    queryKey: ["pendingArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticleBySlug(slug: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Article | null>({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArticleBySlug(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ArticleInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createArticle(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["pendingArticles"] });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      input,
      published,
    }: {
      slug: string;
      input: ArticleInput;
      published: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateArticle(slug, input, published);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["pendingArticles"] });
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteArticle(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedArticles"] });
      queryClient.invalidateQueries({ queryKey: ["pendingArticles"] });
    },
  });
}
