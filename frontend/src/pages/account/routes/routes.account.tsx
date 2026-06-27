const AccountRouteTree = [
  {
    index: true,
    lazy: async () => {
      // Reuse the admin dashboard — the surrounding layout adapts to the role,
      // so non-admins get the same dashboard without an "Admin" badge or nav.
      const { Dashboard } = await import("@/pages/admin/pages/dashboard/Dashboard")

      return { Component: Dashboard }
    },
  },
]

export { AccountRouteTree }
