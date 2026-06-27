import { queryOptions, useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/query-keys"

import { activateUser, createUser, validateEmailToken } from "./user.api"

/**
 * Register a new account.
 *
 * Intentionally just the network call — what to do on success (show the
 * "check your email" screen, surface validation errors) is the caller's job.
 */
const useCreateUser = () => useMutation({ mutationFn: createUser })

/**
 * Query options for checking an activation token.
 *
 * Disabled when there's no token (nothing to check), never retried (a `false`
 * is a definitive answer), and never stale — a token's validity doesn't change
 * while the activation page is open.
 */
const validateEmailTokenQueryOptions = (token: string) =>
  queryOptions({
    queryKey: queryKeys.user.validateEmailToken(token),
    queryFn: () => validateEmailToken(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })

/** Check whether an activation token is still valid. */
const useValidateEmailToken = (token: string) => useQuery(validateEmailTokenQueryOptions(token))

/**
 * Activate an account by setting its password.
 *
 * Just the network call — navigating to login on success and surfacing errors
 * is the caller's job.
 */
const useActivateUser = () => useMutation({ mutationFn: activateUser })

export { useActivateUser, useCreateUser, useValidateEmailToken, validateEmailTokenQueryOptions }
