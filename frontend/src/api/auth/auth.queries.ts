import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/query-keys"

import { getMe, login } from "./auth.api"

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

/**
 * Authenticate with email + password.
 *
 * Intentionally just the network call — storing the returned token in Redux,
 * loading the user and navigating are the caller's job, since those side
 * effects differ by where login is triggered from.
 */
const useLogin = () => useMutation({ mutationFn: login })

export { meQueryOptions, useLogin, useMe }
