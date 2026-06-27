type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  session_token: string
}

export type { LoginRequest, LoginResponse }
