-- name: CreateOrUpdateGithubCredentials :one
INSERT INTO
    github_credentials (
        user_id,
        github_id,
        github_username,
        github_name,
        github_email,
        github_avatar_url,
        github_profile_url,
        access_token,
        token_type,
        scope,
        refresh_token,
        token_expires_at
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
    )
ON CONFLICT (user_id) DO
UPDATE
SET
    github_id = EXCLUDED.github_id,
    github_username = EXCLUDED.github_username,
    github_name = EXCLUDED.github_name,
    github_email = EXCLUDED.github_email,
    github_avatar_url = EXCLUDED.github_avatar_url,
    github_profile_url = EXCLUDED.github_profile_url,
    access_token = EXCLUDED.access_token,
    token_type = EXCLUDED.token_type,
    scope = EXCLUDED.scope,
    refresh_token = EXCLUDED.refresh_token,
    token_expires_at = EXCLUDED.token_expires_at,
    updated_at = CURRENT_TIMESTAMP
RETURNING
    *;

-- name: GetGithubCredentialsByUserID :one
SELECT * FROM github_credentials WHERE user_id = $1 LIMIT 1;
