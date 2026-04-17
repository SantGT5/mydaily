package mail

import (
	"bytes"
	"html/template"
)

type emailTemplateData struct {
	Children template.HTML
}

type welcomeEmailTemplateData struct {
	Email          string
	Name           string
	ActivationLink string
}

type successfulActivateUserAccountEmailTemplateData struct {
	Email  string
	Name   string
	AppURL string
}

var genericEmailTemplate = template.Must(template.New("genericEmailTemplate").Parse(`
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;margin:0;padding:32px 16px;">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(17,24,39,0.06);">
					<tr>
						<td style="padding:40px 32px;">
							{{.Children}}
						</td>
					</tr>
				</table>

				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
					<tr>
						<td align="center" style="padding:16px 24px 0;font-size:12px;line-height:1.6;color:#9ca3af;">
							Please do not reply directly to this email.
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`))

func RenderEmailTemplate(children string) (string, error) {
	var output bytes.Buffer

	err := genericEmailTemplate.Execute(&output, emailTemplateData{
		Children: template.HTML(children),
	})
	if err != nil {
		return "", err
	}

	return output.String(), nil
}
