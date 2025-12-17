package handlers

import (
	"net/http"
	"strconv"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetMultiChallengeStats GET /multi_challenge_stats
func GetMultiChallengeStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Query("user_id")
		challengeId := c.Query("challenge_id")

		// Case 1: Filter by both user_id and challenge_id
		if userId != "" && challengeId != "" {
			userIdInt, err := strconv.Atoi(userId)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid User Id"})
				return
			}

			challengeIdInt, err := strconv.Atoi(challengeId)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Challenge Id"})
				return
			}

			stats, err := q.GetMultiStatsByUserIDAndChallengeID(c.Request.Context(), db.GetMultiStatsByUserIDAndChallengeIDParams{
				UserID:      int32(userIdInt),
				ChallengeID: int32(challengeIdInt),
			})

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch stats"})
				return
			}

			c.JSON(http.StatusOK, stats)
			return
		}

		// Case 2: Filter by user_id only
		if userId != "" {
			userIdInt, err := strconv.Atoi(userId)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid User Id"})
				return
			}

			stats, err := q.GetMultiStatsByUserID(c.Request.Context(), int32(userIdInt))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch stats"})
				return
			}

			c.JSON(http.StatusOK, stats)
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"message": "Either user_id or challenge_id must be provided"})
	}
}

// CreateMultiChallengeStats POST /multi_challenge_stats
func CreateMultiChallengeStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var requestBody struct {
			UserId      int32 `json:"user_id" binding:"required"`
			ChallengeId int32 `json:"challenge_id" binding:"required"`
		}

		// Bind and validate the request body
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid or missing user_id and challenge_id in request body"})
			return
		}

		var stats db.MultiChallengeStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
			return
		}

		newStats, err := q.CreateMultiChallengeStats(c.Request.Context(), db.CreateMultiChallengeStatsParams(stats))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create multi challenge stats"})
			return
		}

		c.JSON(http.StatusCreated, newStats)
	}
}
