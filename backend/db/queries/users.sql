-- name: CreateUser :one
INSERT INTO
    users (full_name, email)
VALUES ($1, $2)
RETURNING
    *;

-- name: GetUserById :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUsers :many
WITH
    params AS (
        SELECT
            BTRIM(
                COALESCE(sqlc.narg (search), '')::text
            ) AS search,
            LOWER(
                BTRIM(
                    COALESCE(
                        sqlc.narg (order_by),
                        'created_at'
                    )::text
                )
            ) AS order_by,
            LOWER(
                BTRIM(
                    COALESCE(sqlc.narg (order_dir), 'desc')::text
                )
            ) AS order_dir,
            COALESCE(sqlc.narg (limit_rows), 10)::int AS limit_rows,
            COALESCE(sqlc.narg (offset_rows), 1)::int AS offset_rows,
            COALESCE(
                sqlc.narg (exclude_sensitive),
                false
            )::bool AS exclude_sensitive
    )
SELECT
    u.id,
    CASE
        WHEN p.exclude_sensitive THEN NULL::varchar(255)
        ELSE u.hashed_password
    END AS hashed_password,
    u.full_name,
    u.email,
    u.is_active,
    u.is_email_verified,
    u.created_at,
    u.updated_at
FROM users AS u
    CROSS JOIN params AS p
WHERE
    p.search = ''
    OR u.id::text ILIKE '%' || p.search || '%'
    OR u.full_name ILIKE '%' || p.search || '%'
    OR u.email ILIKE '%' || p.search || '%'
    OR u.is_active::text ILIKE '%' || p.search || '%'
    OR u.is_email_verified::text ILIKE '%' || p.search || '%'
    OR u.created_at::text ILIKE '%' || p.search || '%'
    OR u.updated_at::text ILIKE '%' || p.search || '%'
ORDER BY
    -- ASC ordering by whitelisted fields only.
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'id' THEN u.id
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'full_name' THEN u.full_name
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'email' THEN u.email
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'is_active' THEN u.is_active
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'is_email_verified' THEN u.is_email_verified
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'created_at' THEN u.created_at
    END ASC,
    CASE
        WHEN p.order_dir = 'asc'
        AND p.order_by = 'updated_at' THEN u.updated_at
    END ASC,
    -- DESC ordering by whitelisted fields only.
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'id' THEN u.id
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'full_name' THEN u.full_name
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'email' THEN u.email
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'is_active' THEN u.is_active
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'is_email_verified' THEN u.is_email_verified
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'created_at' THEN u.created_at
    END DESC,
    CASE
        WHEN p.order_dir = 'desc'
        AND p.order_by = 'updated_at' THEN u.updated_at
    END DESC,
    -- Stable default fallback: latest users first.
    u.created_at DESC
LIMIT CASE
        WHEN p.limit_rows = -1 THEN NULL
        WHEN p.limit_rows < 0 THEN 10
        WHEN p.limit_rows = 0 THEN 10
        ELSE p.limit_rows
    END
OFFSET
    CASE
        WHEN p.offset_rows < 0 THEN 1
        WHEN p.offset_rows = 0 THEN 1
        ELSE p.offset_rows
    END;

-- name: UpdateUser :one
UPDATE users
SET
    full_name = $2,
    is_active = $3,
    hashed_password = $4,
    is_email_verified = $5
WHERE
    id = $1
RETURNING
    *;

-- name: SoftDeleteUserById :exec
UPDATE users SET is_active = FALSE WHERE id = $1;

-- name: SoftDeleteUserByEmail :exec
UPDATE users SET is_active = FALSE WHERE email = $1;

-- name: SoftDeleteUserByIdMany :exec
UPDATE users SET is_active = FALSE WHERE id = ANY ($1);

-- name: SoftDeleteUserByEmailMany :exec
UPDATE users SET is_active = FALSE WHERE email = ANY ($1);