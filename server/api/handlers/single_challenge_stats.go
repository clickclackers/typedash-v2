package handlers

import (
	"strconv"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetSingleChallengeStats GET /single_challenge_stats
func GetSingleChallengeStats(q *db.Queries) gin.HandlerFunc {
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

			stats, err := q.GetSingleStatsByUserIDAndChallengeID(c.Request.Context(), db.GetSingleStatsByUserIDAndChallengeIDParams{
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

			stats, err := q.GetSingleStatsByUserID(c.Request.Context(), int32(userIDInt))
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch stats"})
				return
			}

			c.JSON(200, stats)
			return
		}

		// Case 3: Filter by challenge_id only
		if challengeId != "" {
			challengeIDInt, err := strconv.Atoi(challengeId)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid Challenge ID"})
				return
			}

			stats, err := q.GetSingleStatsByChallengeID(c.Request.Context(), int32(challengeIDInt))
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch stats"})
				return
			}

			c.JSON(200, stats)
			return
		}

		// Case 4: No query parameters provided
		c.JSON(400, gin.H{"error": "At least one query parameter (user_id or challenge_id) is required"})
	}
}

// CreateSingleChallengeStats POST /single_challenge_stats
func CreateSingleChallengeStats(q *db.Queries) gin.HandlerFunc {
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

		var stats db.SingleChallengeStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		newStats, err := q.CreateSingleChallengeStats(c.Request.Context(), db.CreateSingleChallengeStatsParams(stats))
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create single challenge stats"})
			return
		}

		c.JSON(201, newStats)
	}
}
