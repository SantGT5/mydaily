package api

// ErrorResponse is used in Swagger for JSON error bodies.
type ErrorResponse struct {
	Error string `json:"error"`
}

// ValidationErrorResponse is returned when request body fails struct validation.
type ValidationErrorResponse struct {
	ValidationError map[string]string `json:"validationError"`
}
