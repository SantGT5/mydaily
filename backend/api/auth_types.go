package api

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	SessionToken string `json:"session_token"`
}

func LoginToResponse(sessionToken string) LoginResponse {
	return LoginResponse{
		SessionToken: sessionToken,
	}
}
