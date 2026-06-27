import { QueryClient } from "@tanstack/react-query"

/**
 * App-wide TanStack Query client.
 *
 * Exported as a singleton so the same cache is shared between React components
 * (via `QueryClientProvider`) and React Router loaders (via
 * `queryClient.ensureQueryData(...)`). They must be the same instance, or the
 * data a loader prefetches won't be visible to the components that render next.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute before a background refetch.
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export { queryClient }
