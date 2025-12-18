-- name: GetChallengeByID :one
SELECT *
FROM challenges
WHERE id = $1;

-- name: GetChallengesByCategory :many
SELECT 
  challenges.id AS id,
  challenges.title AS title,
  challenges.author AS author,
  challenges.text AS text,
  categories.name AS category,
  categories.id AS category_id
FROM challenges
JOIN categories ON challenges.category_id = categories.id
WHERE categories.id = $1;
