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
