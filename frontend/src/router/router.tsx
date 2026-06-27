import { createBrowserRouter } from "react-router"

import { AdminLayout, RootLayout } from "@/components/layout"
import { AdminRoutes } from "@/pages/admin"
import { AdminRouteTree } from "@/pages/admin/routes/routes.admin"
import { AuthRoutes } from "@/pages/auth"
import { AuthRouteTree } from "@/pages/auth/routes/routes.auth"
import { NotFound } from "@/pages/error"

import { adminRouteLoader, publicRouteLoader } from "./router.loader"

const router = createBrowserRouter([
  {
    path: AuthRoutes.Login.path,
    element: <RootLayout />,
    loader: publicRouteLoader,
    HydrateFallback: () => null,
    children: AuthRouteTree,
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
