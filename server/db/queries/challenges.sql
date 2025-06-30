-- name: GetChallengeByID :one
SELECT *
FROM challenges
WHERE id = $1;

-- name: GetChallengesByCategory :many
SELECT *
FROM challenges
WHERE category = $1;
