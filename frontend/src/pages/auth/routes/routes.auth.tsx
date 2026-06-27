import { AuthRoutes } from "./routes.config"

const AuthRouteTree = [
  {
    index: true,
    lazy: async () => {
      const { Login } = await import("../pages/login/Login")

      return { Component: Login }
    },
  },
  {
    path: AuthRoutes.activeAccount.path,
    lazy: async () => {
      const { ActiveAccount } = await import("../pages/active-account/ActiveAccount")

      return { Component: ActiveAccount }
    },
  },
]

export { AuthRouteTree }
