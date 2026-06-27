import { AdminRoutes } from "./routes.config"

const AdminRouteTree = [
  {
    index: true,
    lazy: async () => {
      const { Dashboard } = await import("../pages/dashboard/Dashboard")

      return { Component: Dashboard }
    },
  },
  {
    path: AdminRoutes.Users.path,
    lazy: async () => {
      const { Users } = await import("../pages/users/Users")

      return { Component: Users }
    },
  },
]

export { AdminRouteTree }
