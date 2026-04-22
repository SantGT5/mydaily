-- Idempotent bootstrap: inserts the default admin only when the email is absent.
INSERT INTO
    users (
        id,
        hashed_password,
        full_name,
        email,
        is_active,
        is_email_verified,
        role,
        created_at,
        updated_at
    )
SELECT '2baefc96-1d63-42f4-b765-248003f18bb4'::uuid, '$2a$14$dmkKxp1BEQUuvzP.85ySR.wqnr5Rwwad.abgdlkT1sRl2ONOwCAIi', 'Gian Lucas', 'gianspf@gmail.com', TRUE, TRUE, 'admin'::user_role, NOW(), NOW()
WHERE
    NOT EXISTS (
        SELECT 1
        FROM users
        WHERE
            email = 'gianspf@gmail.com'
    );
