-- name: GetOverviewStatsByUserID :one
SELECT *
FROM user_overview_stats
WHERE user_id = $1;

-- name: CreateUserOverviewStats :one
INSERT INTO user_overview_stats (user_id, single_total_races, single_total_time, single_avg_wpm, multi_total_races,
                                 multi_total_time, multi_avg_wpm)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;

-- name: UpdateUserOverviewStatsForSingleChallenge :one
UPDATE user_overview_stats
SET 
    single_total_races = single_total_races + 1,
    single_total_time = single_total_time + $2,
    single_avg_wpm = ((single_avg_wpm * single_total_races) + $3) / (single_total_races + 1)
WHERE user_id = $1
RETURNING *;
