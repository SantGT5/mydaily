// Routes for the signed-in, non-admin user area. Sub-pages live under
// `/account/...` (e.g. `basePath("settings")`); only the dashboard exists today.
const basePath = (url: string) => `/account/${url}`

const AccountRoutes = {
  Dashboard: { path: "/account" },
}

export { AccountRoutes, basePath }
