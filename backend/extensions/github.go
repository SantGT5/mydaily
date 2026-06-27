package extensions

import (
	"context"
	"errors"
	"strings"
	"time"

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

type GithubRepo struct {
	ID            int64  `json:"id"`
	Name          string `json:"name"`
	FullName      string `json:"full_name"`
	Owner         string `json:"owner"`
	Private       bool   `json:"private"`
	Description   string `json:"description"`
	DefaultBranch string `json:"default_branch"`
	Language      string `json:"language"`
	HTMLURL       string `json:"html_url"`
}

type GithubCommit struct {
	SHA         string    `json:"sha"`
	Message     string    `json:"message"`
	AuthorName  string    `json:"author_name"`
	AuthorEmail string    `json:"author_email"`
	AuthorLogin string    `json:"author_login"`
	AuthorDate  time.Time `json:"author_date"`
	HTMLURL     string    `json:"html_url"`
}

// GithubCommitsFilter holds the optional filters supported when listing commits.
// Zero values are ignored, so an empty filter returns the most recent commits.
type GithubCommitsFilter struct {
	Since   time.Time
	Until   time.Time
	Page    int
	PerPage int
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

// ListGithubRepos returns the repositories the authenticated user can access,
// sorted by most recently updated.
func ListGithubRepos(ctx context.Context, accessToken string, page, perPage int) ([]GithubRepo, error) {
	if strings.TrimSpace(accessToken) == "" {
		return nil, errors.New("github access token is required")
	}

	client := github.NewClient(nil).WithAuthToken(accessToken)

	opts := &github.RepositoryListByAuthenticatedUserOptions{
		Sort: "updated",
		ListOptions: github.ListOptions{
			Page:    page,
			PerPage: perPage,
		},
	}

	repos, _, err := client.Repositories.ListByAuthenticatedUser(ctx, opts)
	if err != nil {
		return nil, err
	}

	result := make([]GithubRepo, 0, len(repos))
	for _, repo := range repos {
		if repo == nil {
			continue
		}
		result = append(result, GithubRepo{
			ID:            repo.GetID(),
			Name:          repo.GetName(),
			FullName:      repo.GetFullName(),
			Owner:         repo.GetOwner().GetLogin(),
			Private:       repo.GetPrivate(),
			Description:   repo.GetDescription(),
			DefaultBranch: repo.GetDefaultBranch(),
			Language:      repo.GetLanguage(),
			HTMLURL:       repo.GetHTMLURL(),
		})
	}

	return result, nil
}

// ListGithubCommits resolves a repository by its numeric ID and returns its
// commits, applying the optional date-range and pagination filters.
func ListGithubCommits(ctx context.Context, accessToken string, repoID int64, filter GithubCommitsFilter) ([]GithubCommit, error) {
	if strings.TrimSpace(accessToken) == "" {
		return nil, errors.New("github access token is required")
	}
	if repoID <= 0 {
		return nil, errors.New("github repository id is required")
	}

	client := github.NewClient(nil).WithAuthToken(accessToken)

	repo, _, err := client.Repositories.GetByID(ctx, repoID)
	if err != nil {
		return nil, err
	}
	if repo == nil {
		return nil, errors.New("github repository not found")
	}

	owner := repo.GetOwner().GetLogin()
	name := repo.GetName()
	if owner == "" || name == "" {
		return nil, errors.New("github repository owner or name not found")
	}

	opts := &github.CommitsListOptions{
		Since: filter.Since,
		Until: filter.Until,
		ListOptions: github.ListOptions{
			Page:    filter.Page,
			PerPage: filter.PerPage,
		},
	}

	commits, _, err := client.Repositories.ListCommits(ctx, owner, name, opts)
	if err != nil {
		return nil, err
	}

	result := make([]GithubCommit, 0, len(commits))
	for _, c := range commits {
		if c == nil {
			continue
		}
		commit := c.GetCommit()
		author := commit.GetAuthor()
		result = append(result, GithubCommit{
			SHA:         c.GetSHA(),
			Message:     commit.GetMessage(),
			AuthorName:  author.GetName(),
			AuthorEmail: author.GetEmail(),
			AuthorLogin: c.GetAuthor().GetLogin(),
			AuthorDate:  author.GetDate().Time,
			HTMLURL:     c.GetHTMLURL(),
		})
	}

	return result, nil
}
