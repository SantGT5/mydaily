/**
 * Central registry of TanStack Query keys.
 *
 * Keeping every key in one factory means:
 *  - keys stay consistent between the query that reads and the code that
 *    invalidates (e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })`),
 *  - you can invalidate a whole feature at once via its `all` key,
 *  - paginated lists can fold their params into the key so each page is cached
 *    separately (see the commented example below).
 */
const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  user: {
    all: ["user"] as const,
    validateEmailToken: (token: string) =>
      [...queryKeys.user.all, "validate-email-token", token] as const,
  },

  // Example for a future paginated resource — each (page, perPage) combo is its
  // own cache entry, and `repos.all` invalidates every page at once:
  //
  // repos: {
  //   all: ["repos"] as const,
  //   list: (params: { page: number; perPage: number }) =>
  //     [...queryKeys.repos.all, "list", params] as const,
  // },
} as const

export { queryKeys }
