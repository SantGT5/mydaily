import { isAxiosError } from "axios"

import { http } from "@/api/http"
import { ActivateUserRequest, CreateUserRequest, UserResponse } from "@/type"

/**
 * POST /users/ — register a new account.
 *
 * The backend creates the user in a not-yet-activated state and emails an
 * activation link; the caller doesn't get a session back, so sign-up ends on a
 * "check your email" screen rather than logging the user in. Raw request
 * functions live in `*.api.ts`; the mutation wiring lives in `*.queries.ts`.
 */
const createUser = async (payload: CreateUserRequest): Promise<UserResponse> => {
  const { data } = await http.post<UserResponse>("/users/", payload)

  return data
}

/**
 * GET /users/validate-email-token/{token}/ — is this activation link still good?
 *
 * The endpoint answers with a bare boolean: `200 true` for a valid token and
 * `400 false` for an expired/unknown one. A 400 here is a definitive "no", not a
 * transport failure, so it's normalised to `false`; anything else propagates.
 */
const validateEmailToken = async (token: string): Promise<boolean> => {
  try {
    const { data } = await http.get<boolean>(
      `/users/validate-email-token/${encodeURIComponent(token)}/`
    )

    return data === true
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 400) return false

    throw error
  }
}

/**
 * POST /users/activate/ — set the account password and flip it to active.
 *
 * Takes the token from the activation link plus the chosen password; the server
 * re-validates both, so the client-side checks are only for fast feedback.
 */
const activateUser = async (payload: ActivateUserRequest): Promise<UserResponse> => {
  const { data } = await http.post<UserResponse>("/users/activate/", payload)

  return data
}

export { activateUser, createUser, validateEmailToken }
