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
