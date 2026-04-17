package utils

import (
	"errors"
	"fmt"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

// IsValidPassword checks if the password is valid.
// It returns true if the password is valid, false otherwise.
func IsValidPassword(p string) bool {
	var (
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	if len(p) < 8 || len(p) > 64 {
		return false
	}

	for _, char := range p {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasUpper && hasLower && hasNumber && hasSpecial
}

// ValidationErrors maps JSON-style field keys (e.g. fullName, email) to human-readable messages.
// It returns false if err does not contain validator.ValidationErrors (e.g. malformed JSON body).
func ValidationErrors(err error) (map[string]string, bool) {
	var errs validator.ValidationErrors
	if !errors.As(err, &errs) {
		return nil, false
	}
	out := make(map[string]string, len(errs))
	for _, fe := range errs {
		key := structFieldToJSONKey(fe.Field())
		if _, exists := out[key]; exists {
			continue
		}
		out[key] = messageForFieldTag(fe.Field(), fe.Tag())
	}
	return out, true
}

func structFieldToJSONKey(field string) string {
	if field == "" {
		return ""
	}
	r := []rune(field)
	r[0] = unicode.ToLower(r[0])
	return string(r)
}

func humanizeFieldName(field string) string {
	var b strings.Builder
	for i, r := range field {
		if i > 0 && unicode.IsUpper(r) {
			b.WriteRune(' ')
		}
		b.WriteRune(unicode.ToLower(r))
	}
	return b.String()
}

func messageForFieldTag(structField, tag string) string {
	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", humanizeFieldName(structField))
	case "email":
		return "invalid email format"
	case "min":
		return fmt.Sprintf("%s is too short", humanizeFieldName(structField))
	case "max":
		return fmt.Sprintf("%s is too long", humanizeFieldName(structField))
	default:
		return fmt.Sprintf("%s is invalid", humanizeFieldName(structField))
	}
}
