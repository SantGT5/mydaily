package api

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/SantGT5/mydaily/config"
	db "github.com/SantGT5/mydaily/db/sqlc"
	"github.com/SantGT5/mydaily/extensions"
	"github.com/SantGT5/mydaily/redis"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GithubOAuthCallbackResponse struct {
	AccessToken string                           `json:"access_token"`
	TokenType   string                           `json:"token_type"`
	Scope       string                           `json:"scope"`
	GithubUser  extensions.GithubUserCredentials `json:"github_user"`
}

type githubAccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
	Error       string `json:"error"`
}

// @Summary Redirect user to GitHub OAuth
// @Description Redirects user to GitHub consent page
// @Tags github
// @Produce json
// @Success 302
// @Failure 500 {object} ErrorResponse
// @Router /connect/github/ [get]
// @Security X-Session
func (server *Server) ConnectGithub(ctx *gin.Context) {
	clientID := config.GithubClientID
	clientSecret := config.GithubClientSecret
	redirectURL := config.GithubRedirectURL
	if clientID == "" || clientSecret == "" || redirectURL == "" {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Missing GitHub OAuth environment variables."})
		return
	}

	user, ok := ctx.Get("loggedInUser")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not get user ID."})
		return
	}

	userData, ok := user.(db.User)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	state, err := redis.StoreServiceToken(ctx, userData.ID.String(), redis.ServiceTokenGithub)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not store GitHub CSRF state."})
		return
	}

	params := url.Values{}
	params.Set("client_id", clientID)
	params.Set("redirect_uri", redirectURL)
	params.Set("scope", "read:user user:email repo")
	params.Set("state", state)

	authURL := "https://github.com/login/oauth/authorize?" + params.Encode()
	ctx.Redirect(http.StatusFound, authURL)
}

// @Summary GitHub OAuth callback
// @Description Exchanges GitHub code for access token and fetches user profile
// @Tags github
// @Produce json
// @Param code query string true "GitHub OAuth authorization code"
// @Param state query string false "CSRF state token"
// @Success 200 {object} GithubOAuthCallbackResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /connect/github/callback/ [get]
func (server *Server) ConnectGithubCallback(ctx *gin.Context) {
	clientID := config.GithubClientID
	clientSecret := config.GithubClientSecret
	redirectURL := config.GithubRedirectURL
	if clientID == "" || clientSecret == "" || redirectURL == "" {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Missing GitHub OAuth environment variables."})
		return
	}

	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Missing code query param."})
		return
	}

	state := ctx.Query("state")
	if state == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Missing state query param."})
		return
	}

	storedState, err := redis.GetServiceToken(ctx, state, true, redis.ServiceTokenGithub)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not validate GitHub CSRF state."})
		return
	}
	if storedState == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "GitHub CSRF state mismatch."})
		return
	}

	form := url.Values{}
	form.Set("client_id", clientID)
	form.Set("client_secret", clientSecret)
	form.Set("code", code)
	form.Set("redirect_uri", redirectURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://github.com/login/oauth/access_token", strings.NewReader(form.Encode()))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not build GitHub token request."})
		return
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	httpClient := &http.Client{Timeout: 15 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not exchange code for GitHub access token."})
		return
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not read GitHub token response."})
		return
	}
	if resp.StatusCode != http.StatusOK {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not exchange code for GitHub access token."})
		return
	}

	var token githubAccessTokenResponse
	if err := json.Unmarshal(body, &token); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not parse GitHub token response."})
		return
	}
	if token.AccessToken == "" || token.Error != "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not exchange code for GitHub access token."})
		return
	}

	credentials, err := extensions.GetGithubUserCredentials(ctx, token.AccessToken)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not fetch GitHub user credentials."})
		return
	}

	err = redis.CleanUserServiceKeys(ctx, state, redis.ServiceTokenGithub)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not clean GitHub CSRF state."})
		return
	}

	userID, err := uuid.Parse(storedState)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Could not resolve logged-in user for GitHub credentials."})
		return
	}

	_, err = server.store.CreateOrUpdateGithubCredentials(ctx, db.CreateOrUpdateGithubCredentialsParams{
		UserID:           userID,
		TokenType:        token.TokenType,
		GithubUsername:   credentials.Login,
		AccessToken:      token.AccessToken,
		GithubID:         credentials.GithubID,
		TokenExpiresAt:   sql.NullTime{Valid: false},
		RefreshToken:     sql.NullString{Valid: false},
		Scope:            sql.NullString{String: token.Scope, Valid: token.Scope != ""},
		GithubName:       sql.NullString{String: credentials.Name, Valid: credentials.Name != ""},
		GithubEmail:      sql.NullString{String: credentials.Email, Valid: credentials.Email != ""},
		GithubAvatarUrl:  sql.NullString{String: credentials.AvatarURL, Valid: credentials.AvatarURL != ""},
		GithubProfileUrl: sql.NullString{String: credentials.ProfileURL, Valid: credentials.ProfileURL != ""},
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not store GitHub credentials."})
		return
	}

	ctx.JSON(http.StatusOK, GithubOAuthCallbackResponse{
		Scope:      token.Scope,
		GithubUser: credentials,
		TokenType:  token.TokenType,
	})
}

// GithubReposResponse wraps the list of repositories for the connected account.
type GithubReposResponse struct {
	Repos []extensions.GithubRepo `json:"repos"`
}

// GithubCommitsResponse wraps the list of commits for a repository.
type GithubCommitsResponse struct {
	Commits []extensions.GithubCommit `json:"commits"`
}

// GetReposRequest captures the optional pagination query params.
type GetReposRequest struct {
	Page    int `form:"page"`
	PerPage int `form:"per_page"`
}

// GetCommitsRequest captures the query filters for listing commits.
type GetCommitsRequest struct {
	RepoID  int64  `form:"repo_id" binding:"required"`
	From    string `form:"from"`
	To      string `form:"to"`
	Page    int    `form:"page"`
	PerPage int    `form:"per_page"`
}

// parseGithubDate accepts either an RFC3339 timestamp or a plain YYYY-MM-DD
// date. An empty string yields the zero time, which callers treat as "no filter".
func parseGithubDate(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, nil
	}
	if t, err := time.Parse(time.RFC3339, value); err == nil {
		return t, nil
	}
	return time.Parse("2006-01-02", value)
}

// @Summary List GitHub repositories
// @Description Lists repositories for the connected GitHub account, most recently updated first
// @Tags github
// @Produce json
// @Param page query int false "Page number for pagination"
// @Param per_page query int false "Results per page (max 100)"
// @Success 200 {object} GithubReposResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /connect/github/repos/ [get]
// @Security X-Session
func (server *Server) GetRepos(ctx *gin.Context) {
	user, ok := ctx.Get("loggedInUser")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not get user ID."})
		return
	}

	userData, ok := user.(db.User)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req GetReposRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid query params."})
		return
	}

	credentials, err := server.store.GetGithubCredentialsByUserID(ctx, userData.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong authenticating github."})
		return
	}

	repos, err := extensions.ListGithubRepos(ctx, credentials.AccessToken, req.Page, req.PerPage)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not fetch GitHub repositories."})
		return
	}

	ctx.JSON(http.StatusOK, GithubReposResponse{Repos: repos})
}

// @Summary List GitHub commits
// @Description Lists commits for a connected GitHub repository, optionally filtered by a date range
// @Tags github
// @Produce json
// @Param repo_id query int true "GitHub repository ID"
// @Param from query string false "Only include commits after this date (RFC3339 or YYYY-MM-DD)"
// @Param to query string false "Only include commits before this date (RFC3339 or YYYY-MM-DD)"
// @Param page query int false "Page number for pagination"
// @Param per_page query int false "Results per page (max 100)"
// @Success 200 {object} GithubCommitsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /connect/github/commits/ [get]
// @Security X-Session
func (server *Server) GetCommits(ctx *gin.Context) {
	user, ok := ctx.Get("loggedInUser")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not get user ID."})
		return
	}

	userData, ok := user.(db.User)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Unauthorized"})
		return
	}

	var req GetCommitsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid or missing query params. 'repo_id' is required."})
		return
	}

	since, err := parseGithubDate(req.From)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid 'from' date. Use RFC3339 or YYYY-MM-DD."})
		return
	}

	until, err := parseGithubDate(req.To)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid 'to' date. Use RFC3339 or YYYY-MM-DD."})
		return
	}

	credentials, err := server.store.GetGithubCredentialsByUserID(ctx, userData.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong authenticating github."})
		return
	}

	commits, err := extensions.ListGithubCommits(ctx, credentials.AccessToken, req.RepoID, extensions.GithubCommitsFilter{
		Since:   since,
		Until:   until,
		Page:    req.Page,
		PerPage: req.PerPage,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Could not fetch GitHub commits."})
		return
	}

	ctx.JSON(http.StatusOK, GithubCommitsResponse{Commits: commits})
}
