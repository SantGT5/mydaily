type CreateUserRequest = {
  email: string
  full_name: string
  role: "user" | "admin"
}

type ActivateUserRequest = {
  token: string
  password: string
}

type UserResponse = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
  role: "user" | "admin"
  is_email_verified: boolean
}

export type { ActivateUserRequest, CreateUserRequest, UserResponse }
