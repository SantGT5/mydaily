import { queryOptions, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/query-keys"

import { getMe } from "./auth.api"

/**
 * Query options for the current user.
 *
 * Sharing one `queryOptions` object between the React Router loader
 * (`queryClient.ensureQueryData(meQueryOptions())`) and the `useMe()` hook keeps
 * the key + fetcher in one place. The loader warms the cache, so `useMe()`
 * renders instantly with no second network request.
 */
const meQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    // Don't retry auth checks — a 401 is a definitive "not logged in".
    retry: false,
  })

/** Read the current user inside a component. */
const useMe = () => useQuery(meQueryOptions())

export { meQueryOptions, useMe }
