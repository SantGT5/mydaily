import { UserRoutes } from "./routes.config"

const UserRouteTree = [
  {
    path: UserRoutes.SignUp.path,
    lazy: async () => {
      const { SignUp } = await import("../pages/sign-up/SignUp")

      return { Component: SignUp }
    },
  },
]

export { UserRouteTree }
