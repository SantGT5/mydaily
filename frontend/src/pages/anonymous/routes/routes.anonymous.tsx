const AnonymousRouteTree = [
  {
    index: true,
    lazy: async () => {
      const { Home } = await import("../pages/home/Home")

      return { Component: Home }
    },
  },
]

export { AnonymousRouteTree }
