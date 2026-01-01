package handlers

import (
	"net/http"
	"strconv"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetSingleChallengeStats GET /single_challenge_stats
func GetSingleChallengeStats(q *db.Queries) gin.HandlerFunc {
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

			stats, err := q.GetSingleStatsByUserIDAndChallengeID(c.Request.Context(), db.GetSingleStatsByUserIDAndChallengeIDParams{
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

			stats, err := q.GetSingleStatsByUserID(c.Request.Context(), int32(userIdInt))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch stats"})
				return
			}

			c.JSON(http.StatusOK, stats)
			return
		}

		// Case 3: Filter by challenge_id only
		if challengeId != "" {
			challengeIdInt, err := strconv.Atoi(challengeId)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Challenge Id"})
				return
			}

			stats, err := q.GetSingleStatsByChallengeID(c.Request.Context(), int32(challengeIdInt))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to fetch stats"})
				return
			}

			c.JSON(http.StatusOK, stats)
			return
		}

		// Case 4: No query parameters provided
		c.JSON(http.StatusBadRequest, gin.H{"message": "At least one query parameter (user_id or challenge_id) is required"})
	}
}
