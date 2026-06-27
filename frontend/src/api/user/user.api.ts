import { http } from "@/api/http"
import { CreateUserRequest, UserResponse } from "@/type"

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

export { createUser }
