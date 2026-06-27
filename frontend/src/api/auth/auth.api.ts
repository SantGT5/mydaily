import { http } from "@/api/http"
import { Me } from "@/type"

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

export { getMe }
