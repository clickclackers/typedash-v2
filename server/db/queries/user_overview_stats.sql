-- name: GetOverviewStatsByUserID :one
SELECT *
FROM user_overview_stats
WHERE user_id = $1;

-- name: CreateUserOverviewStats :one
INSERT INTO user_overview_stats (user_id)
VALUES ($1)
RETURNING *;
