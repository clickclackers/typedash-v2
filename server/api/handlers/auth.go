package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	db "github.com/clickclackers/typedash-v2/db/sqlc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterHandler handles user registration
func RegisterHandler(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data: " + err.Error()})
			return
		}

		// Check if user/email already exists
		_, err := q.GetUserByEmail(c.Request.Context(), req.Email)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"message": "Email already exists"})
			return
		} else if !errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		_, err = q.GetUserByUsername(c.Request.Context(), req.Username)
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"message": "Username already exists"})
			return
		} else if !errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		// Hash password
		passwordHash, err := HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
			return
		}

		// Create user
		user, err := q.CreateUser(c.Request.Context(), db.CreateUserParams{
			Username:     req.Username,
			Email:        req.Email,
			PasswordHash: passwordHash,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
			return
		}

		// Create default stats
		_, createErr := q.CreateUserOverviewStats(c.Request.Context(), db.CreateUserOverviewStatsParams{
			UserID:           int32(user.ID),
			SingleTotalRaces: 0,
			SingleTotalTime:  0,
			SingleAvgWpm:     0,
			MultiTotalRaces:  0,
			MultiTotalTime:   0,
			MultiAvgWpm:      0,
		})
		if createErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user overview stats"})
			return
		}

		// Generate JWT token
		token, err := GenerateToken(user.ID, req.Username, req.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "User registered successfully",
			"token":   token,
			"user": gin.H{
				"id":       user.ID,
				"username": req.Username,
				"email":    req.Email,
			},
		})
	}
}

// LoginHandler handles user login
func LoginHandler(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data: " + err.Error()})
			return
		}

		// Get user from database by email
		user, err := q.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
			}
			return
		}

		// Check password
		if !CheckPasswordHash(req.Password, user.PasswordHash) {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
			return
		}

		// Generate JWT token
		token, err := GenerateToken(user.ID, user.Username, user.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"token":   token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
			},
		})
	}
}

// LogoutHandler handles user logout
func LogoutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// In a stateless JWT system, logout is typically handled client-side
		// by removing the token. However, we can implement a token blacklist
		// or simply return a success message.
		c.JSON(http.StatusOK, gin.H{
			"message": "Logout successful",
		})
	}
}

// GetUserProfileHandler returns the current user's profile
func GetUserProfileHandler(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, exists := c.Get("userId")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
			return
		}

		// Convert userId to int32
		userIdInt32, ok := userId.(int32)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid user Id type"})
			return
		}

		user, err := q.GetUser(c.Request.Context(), userIdInt32)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get user data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"email":    user.Email,
			},
		})
	}
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a password with its hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(userId int32, username, email string) (string, error) {
	claims := Claims{
		UserID:   userId,
		Username: username,
		Email:    email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
