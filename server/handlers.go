package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
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
func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data: " + err.Error()})
		return
	}

	// Check if user/email already exists
	_, _, _, _, err := GetUserByEmail(req.Email)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Email already exists"})
		return
	} else if err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		return
	}

	// Hash password
	passwordHash, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	// Create user
	userID, err := CreateUser(req.Username, req.Email, passwordHash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := GenerateToken(userID, req.Username, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"token":   token,
		"user": gin.H{
			"id":       userID,
			"username": req.Username,
			"email":    req.Email,
		},
	})
}

// LoginHandler handles user login
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request data: " + err.Error()})
		return
	}

	// Get user from database by email
	userID, username, email, passwordHash, err := GetUserByEmail(req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		}
		return
	}

	// Check password
	if !CheckPasswordHash(req.Password, passwordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := GenerateToken(userID, username, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":       userID,
			"username": username,
			"email":    email,
		},
	})
}

// LogoutHandler handles user logout
func LogoutHandler(c *gin.Context) {
	// In a stateless JWT system, logout is typically handled client-side
	// by removing the token. However, we can implement a token blacklist
	// or simply return a success message.
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

// GetUserProfileHandler returns the current user's profile
func GetUserProfileHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
		return
	}

	// Convert userID to int32
	userIDInt32, ok := userID.(int32)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Invalid user ID type"})
		return
	}

	username, email, err := GetUserByID(userIDInt32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to get user data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":       userIDInt32,
			"username": username,
			"email":    email,
		},
	})
}
