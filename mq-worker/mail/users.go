package mail

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"log"

	"github.com/SantGT5/mydaily-worker/config"
)

var WelcomeEmailTemplate = template.Must(template.New("welcomeEmailTemplate").Parse(`
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
	<tr>
		<td style="padding:0 0 24px;">
			<div style="display:inline-block;padding:6px 12px;border-radius:999px;background-color:#eef2ff;color:#4338ca;font-size:12px;font-weight:700;letter-spacing:0.02em;">
				Welcome
			</div>
		</td>
	</tr>

	<tr>
		<td style="padding:0 0 12px;">
			<h1 style="margin:0;font-size:30px;line-height:1.25;font-weight:700;color:#111827;">
				Welcome{{if .Name}}, {{.Name}}{{end}}!
			</h1>
		</td>
	</tr>

	<tr>
		<td style="padding:0 0 16px;">
			<p style="margin:0;font-size:16px;line-height:1.75;color:#4b5563;">
				Thanks for creating your account{{if .Email}} with <strong style="color:#111827;">{{.Email}}</strong>{{end}}.
				Please confirm your email address to activate your account and get started.
			</p>
		</td>
	</tr>

	<tr>
		<td style="padding:0 0 24px;">
			<table role="presentation" cellspacing="0" cellpadding="0" border="0">
				<tr>
					<td align="center" style="border-radius:10px;background:linear-gradient(135deg,#4f46e5,#2563eb);">
						<a href="{{.ActivationLink}}" style="display:inline-block;padding:14px 24px;font-size:14px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
							Activate account
						</a>
					</td>
				</tr>
			</table>
		</td>
	</tr>

	<tr>
		<td style="padding:0 0 20px;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
				<tr>
					<td style="padding:16px 18px;">
						<p style="margin:0 0 8px;font-size:13px;line-height:1.6;font-weight:600;color:#111827;">
							Didn't expect this email?
						</p>
						<p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
							You can safely ignore it if you did not create an account.
						</p>
					</td>
				</tr>
			</table>
		</td>
	</tr>

	<tr>
		<td>
			<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b7280;">
				If the button does not work, copy and paste this link into your browser:
			</p>
			<p style="margin:0;font-size:13px;line-height:1.7;word-break:break-all;">
				<a href="{{.ActivationLink}}" style="color:#2563eb;text-decoration:underline;">{{.ActivationLink}}</a>
			</p>
		</td>
	</tr>
</table>
`))

func SendUserWelcomeEmail(message any) {
	b, err := json.Marshal(message)
	if err != nil {
		log.Printf("welcome email: marshal payload: %v", err)
		return
	}
	var payload struct {
		Email    string `json:"email"`
		FullName string `json:"full_name"`
		Token    string `json:"token"`
	}
	if err := json.Unmarshal(b, &payload); err != nil {
		log.Printf("welcome email: invalid JSON payload: %v", err)
		return
	}
	if payload.Email == "" || payload.Token == "" {
		log.Printf("welcome email: missing email or token (empty or absent in message)")
		return
	}

	email := payload.Email
	name := payload.FullName
	activationLink := fmt.Sprintf("%s/auth/activate?token=%s", config.BaseURL, payload.Token)

	var welcomeContent bytes.Buffer

	err = WelcomeEmailTemplate.Execute(&welcomeContent, welcomeEmailTemplateData{
		Email:          email,
		Name:           name,
		ActivationLink: activationLink,
	})

	if err != nil {
		log.Printf("Error executing welcome email template: %v", err)
		return
	}

	html, err := RenderEmailTemplate(welcomeContent.String())

	if err != nil {
		log.Printf("Error rendering welcome email template: %v", err)
		return
	}

	success := SendEmail(html, "Welcome to MyDaily", []string{email})

	if !success {
		log.Printf("Error sending welcome email")
		return
	}
}
