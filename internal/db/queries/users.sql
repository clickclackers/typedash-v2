-- name: CreateUser :one
INSERT INTO users (username, password_hash)
VALUES ($1, $2) RETURNING *;

-- name: GetUser :one
SELECT *
FROM users
WHERE id = $1;

-- name: GetUserByUsername :one
SELECT *
FROM users
WHERE username = $1;

-- name: ListUsers :many
SELECT *
FROM users
ORDER BY id LIMIT $1
OFFSET $2;
