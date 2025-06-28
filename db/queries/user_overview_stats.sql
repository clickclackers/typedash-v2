-- name: GetOverviewStatsByUserID :one
SELECT *
FROM user_overview_stats
WHERE user_id = $1;
