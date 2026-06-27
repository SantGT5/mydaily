const basePath = (url: string) => `/admin/${url}`

const AdminRoutes = {
  Dashboard: { path: "/admin" },
  Users: { path: basePath("users") },
}

export { AdminRoutes }
