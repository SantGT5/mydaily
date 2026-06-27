type Me = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
  role: "admin" | "user"
  is_email_verified: boolean
}

export type { Me }
