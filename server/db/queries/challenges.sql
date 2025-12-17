-- name: GetChallengeByID :one
SELECT *
FROM challenges
WHERE id = $1;

-- name: GetChallengesByCategory :many
SELECT *
FROM challenges
JOIN categories ON challenges.category_id = categories.id
WHERE categories.id = $1;
