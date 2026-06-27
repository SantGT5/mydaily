const basePath = (url: string) => `/user/${url}`

const UserRoutes = {
  SignUp: { path: basePath("sign-up") },
}

export { UserRoutes }
