type CreateUserRequest = {
  full_name: string
  email: string
  role: "user" | "admin"
}

type ActivateUserRequest = {
  token: string
  password: string
}

type UserResponse = {
  id: string
  full_name: string
  email: string
  role: "user" | "admin"
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

export type { ActivateUserRequest, CreateUserRequest, UserResponse }
