import { http } from "@/api/http"
import { LoginRequest, LoginResponse, Me } from "@/type"

/**
 * GET /auth/me/ — the currently authenticated user.
 *
 * The `X-Session` header is added by the axios request interceptor, so this
 * stays a plain "what does the endpoint return" function. Raw request functions
 * like this live in `*.api.ts`; the caching/query wiring lives in `*.queries.ts`.
 */
const getMe = async (): Promise<Me> => {
  const { data } = await http.get<Me>("/auth/me/")

  return data
}

/**
 * POST /auth/login/ — exchange email + password for a session token.
 *
 * The returned `session_token` is what the axios interceptor sends as the
 * `X-Session` header on every subsequent request, so the caller stores it in
 * the Redux session slice before loading the current user.
 */
const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await http.post<LoginResponse>("/auth/login/", payload)

  return data
}

export { getMe, login }
