package handlers

import (
	"strconv"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetMultiChallengeStats GET /multi_challenge_stats
func GetMultiChallengeStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Query("user_id")
		challengeId := c.Query("challenge_id")

		// Case 1: Filter by both user_id and challenge_id
		if userId != "" && challengeId != "" {
			userIDInt, err := strconv.Atoi(userId)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid User ID"})
				return
			}

			challengeIDInt, err := strconv.Atoi(challengeId)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid Challenge ID"})
				return
			}

			stats, err := q.GetMultiStatsByUserIDAndChallengeID(c.Request.Context(), db.GetMultiStatsByUserIDAndChallengeIDParams{
				UserID:      int32(userIDInt),
				ChallengeID: int32(challengeIDInt),
			})

			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch stats"})
				return
			}

			c.JSON(200, stats)
			return
		}

		// Case 2: Filter by user_id only
		if userId != "" {
			userIDInt, err := strconv.Atoi(userId)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid User ID"})
				return
			}

			stats, err := q.GetMultiStatsByUserID(c.Request.Context(), int32(userIDInt))
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch stats"})
				return
			}

			c.JSON(200, stats)
			return
		}

		c.JSON(400, gin.H{"error": "Either user_id or challenge_id must be provided"})
	}
}

// CreateMultiChallengeStats POST /multi_challenge_stats
func CreateMultiChallengeStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var requestBody struct {
			UserID      int32 `json:"user_id" binding:"required"`
			ChallengeID int32 `json:"challenge_id" binding:"required"`
		}

		// Bind and validate the request body
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(400, gin.H{"error": "Invalid or missing user_id and challenge_id in request body"})
			return
		}

		var stats db.MultiChallengeStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		newStats, err := q.CreateMultiChallengeStats(c.Request.Context(), db.CreateMultiChallengeStatsParams(stats))
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create multi challenge stats"})
			return
		}

		c.JSON(201, newStats)
	}
}
