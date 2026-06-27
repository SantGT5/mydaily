const basePath = (url: string) => `/auth/${url}`

const AuthRoutes = {
  Login: { path: "/auth" },
  activeAccount: { path: basePath("active-account") },
}

export { AuthRoutes }
