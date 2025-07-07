-- name: GetSingleStatsByUserID :many
SELECT *
FROM single_challenge_stats
WHERE user_id = $1;

-- name: GetSingleStatsByChallengeID :many
SELECT *
FROM single_challenge_stats
WHERE challenge_id = $1;

-- name: GetSingleStatsByUserIDAndChallengeID :one
SELECT *
FROM single_challenge_stats
WHERE user_id = $1
  AND challenge_id = $2;

-- name: CreateSingleChallengeStats :one
INSERT INTO single_challenge_stats (user_id, challenge_id, created_at, time_taken, wpm, accuracy)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
