import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { ArticleEditorPage } from "./pages/ArticleEditorPage";
import { ArticlePage } from "./pages/ArticlePage";
import { HomePage } from "./pages/HomePage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/article/$slug",
  component: ArticlePage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const adminNewArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/articles/new",
  component: () => <ArticleEditorPage mode="new" />,
});

const adminEditArticleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/articles/edit/$slug",
  component: () => {
    const { slug } = adminEditArticleRoute.useParams();
    return <ArticleEditorPage mode="edit" editSlug={slug} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  articleRoute,
  adminLoginRoute,
  adminDashboardRoute,
  adminNewArticleRoute,
  adminEditArticleRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
