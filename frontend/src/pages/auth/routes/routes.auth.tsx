const AuthRouteTree = [
  {
    index: true,
    lazy: async () => {
      const { Login } = await import("../pages/login/Login")

      return { Component: Login }
    },
  },
]

// Mounted separately from `AuthRouteTree` because the activation flow uses the
// chrome-less `BlankLayout` (no header/footer) rather than the shared `RootLayout`.
const AuthActivateRouteTree = [
  {
    index: true,
    lazy: async () => {
      const { ActiveAccount } = await import("../pages/active-account/ActiveAccount")

      return { Component: ActiveAccount }
    },
  },
]

export { AuthActivateRouteTree, AuthRouteTree }
