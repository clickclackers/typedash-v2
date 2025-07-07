-- name: GetMultiStatsByUserID :many
SELECT *
FROM multi_challenge_stats
WHERE user_id = $1;

-- name: GetMultiStatsByChallengeID :many
SELECT *
FROM multi_challenge_stats
WHERE challenge_id = $1;

-- name: GetMultiStatsByUserIDAndChallengeID :one
SELECT *
FROM multi_challenge_stats
WHERE user_id = $1
  AND challenge_id = $2;

-- name: CreateMultiChallengeStats :one
INSERT INTO multi_challenge_stats (session_id, user_id, challenge_id, created_at, time_taken, wpm, accuracy, num_players, position)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
