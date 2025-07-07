package handlers

import (
	"net/http"
	"strconv"

	db "github.com/clickclackers/typedash-v2/server/db/sqlc"
	"github.com/gin-gonic/gin"
)

// GetUserOverviewStats GET /user_overview_stats/:userId
func GetUserOverviewStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("userId")
		if userId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			return
		}

		userIDInt, err := strconv.Atoi(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
			return
		}

		stats, err := q.GetOverviewStatsByUserID(c.Request.Context(), int32(userIDInt))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user overview stats"})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

// CreateUserOverviewStats POST /user_overview_stats/:userId
func CreateUserOverviewStats(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("userId")
		if userId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			return
		}

		userIDInt, err := strconv.Atoi(userId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
			return
		}

		var stats db.UserOverviewStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		stats.UserID = int32(userIDInt)

		newStats, err := q.CreateUserOverviewStats(c.Request.Context(), db.CreateUserOverviewStatsParams(stats))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user overview stats"})
			return
		}

		c.JSON(http.StatusCreated, newStats)
	}

}
