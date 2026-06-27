import { useMutation } from "@tanstack/react-query"

import { createUser } from "./user.api"

/**
 * Register a new account.
 *
 * Intentionally just the network call — what to do on success (show the
 * "check your email" screen, surface validation errors) is the caller's job.
 */
const useCreateUser = () => useMutation({ mutationFn: createUser })

export { useCreateUser }
