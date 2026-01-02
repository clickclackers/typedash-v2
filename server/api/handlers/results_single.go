package handlers

import (
	"log"
	"net/http"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CreateSingleChallengeResults POST /results_single
func CreateSingleChallengeResults(q *db.Queries, pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
			return
		}

		userIdInt, ok := userId.(int32)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid user ID type"})
			return
		}

		var stats db.SingleChallengeStat
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
			return
		}

		stats.UserID = userIdInt

		context := c.Request.Context()

		tx, err := pool.Begin(context)
		if err != nil {
			log.Printf("error beginning tx: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create single challenge stats"})
			return
		}
		defer func() { _ = tx.Rollback(context) }()

		qtx := q.WithTx(tx)

		_, err = qtx.CreateSingleChallengeStats(context, db.CreateSingleChallengeStatsParams(stats))
		if err != nil {
			log.Printf("error in CreateSingleChallengeStats: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create single challenge stats"})
			return
		}

		_, err = qtx.UpdateUserOverviewStatsForSingleChallenge(context, db.UpdateUserOverviewStatsForSingleChallengeParams{
			UserID:          userIdInt,
			SingleTotalTime: stats.TimeTaken,
			SingleAvgWpm:    stats.Wpm,
		})
		if err != nil {
			log.Printf("error in UpdateUserOverviewStatsForSingleChallenge: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update user overview stats for single challenge"})
			return
		}

		if err := tx.Commit(context); err != nil {
			log.Printf("error committing tx: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to commit database transaction"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Single challenge results created successfully"})
	}
}
