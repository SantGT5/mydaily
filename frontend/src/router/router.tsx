import { createBrowserRouter } from "react-router"

import { AdminLayout, BlankLayout, RootLayout } from "@/components/layout"
import { AdminRoutes } from "@/pages/admin"
import { AdminRouteTree } from "@/pages/admin/routes/routes.admin"
import { AnonymousRoutes } from "@/pages/anonymous"
import { AnonymousRouteTree } from "@/pages/anonymous/routes/routes.anonymous"
import { AuthRoutes } from "@/pages/auth"
import { AuthActivateRouteTree, AuthRouteTree } from "@/pages/auth/routes/routes.auth"
import { NotFound } from "@/pages/error"
import { UserRoutes } from "@/pages/user"
import { UserRouteTree } from "@/pages/user/routes/routes.user"

import { adminRouteLoader, publicRouteLoader } from "./router.loader"

const router = createBrowserRouter([
  {
    path: AnonymousRoutes.Home.path,
    element: <RootLayout />,
    HydrateFallback: () => null,
    children: AnonymousRouteTree,
  },
  {
    path: AuthRoutes.Login.path,
    element: <RootLayout />,
    loader: publicRouteLoader,
    HydrateFallback: () => null,
    children: AuthRouteTree,
  },
  {
    path: AuthRoutes.activeAccount.path,
    element: <BlankLayout />,
    loader: publicRouteLoader,
    HydrateFallback: () => null,
    children: AuthActivateRouteTree,
  },
  {
    path: UserRoutes.SignUp.path,
    element: <RootLayout />,
    loader: publicRouteLoader,
    HydrateFallback: () => null,
    children: UserRouteTree,
  },
  {
    path: AdminRoutes.Dashboard.path,
    element: <AdminLayout />,
    loader: adminRouteLoader,
    HydrateFallback: () => null,
    children: AdminRouteTree,
  },
  {
    path: "*",
    element: <NotFound />,
  },
])

export { router }
