package extensions

import (
	"context"
	"errors"
	"strings"

	"github.com/google/go-github/v85/github"
)

type GithubUserCredentials struct {
	GithubID   int64
	Login      string
	Name       string
	Email      string
	AvatarURL  string
	ProfileURL string
}

func GetGithubUserCredentials(ctx context.Context, accessToken string) (GithubUserCredentials, error) {
	if strings.TrimSpace(accessToken) == "" {
		return GithubUserCredentials{}, errors.New("github access token is required")
	}

	client := github.NewClient(nil).WithAuthToken(accessToken)
	user, _, err := client.Users.Get(ctx, "")
	if err != nil {
		return GithubUserCredentials{}, err
	}
	if user == nil {
		return GithubUserCredentials{}, errors.New("github user not found")
	}

	return GithubUserCredentials{
		GithubID:   user.GetID(),
		Login:      user.GetLogin(),
		Name:       user.GetName(),
		Email:      user.GetEmail(),
		AvatarURL:  user.GetAvatarURL(),
		ProfileURL: user.GetHTMLURL(),
	}, nil
}
