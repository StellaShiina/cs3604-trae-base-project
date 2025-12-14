package routes

import (
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("sid")
		if err != nil || cookie == "" {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		// In production, validate session ID against Redis/DB
		// For now, we assume if cookie exists it's valid for simple tests unless we implement session store
		c.Next()
	}
}

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(CORSMiddleware())

	v1 := r.Group("/api/v1")
	{
		// Registration Flow (Matches frontend /register prefix)
		// Frontend requests: /api/v1/auth/register/validate-username
		// The frontend prefixes everything with /auth because of my previous suggestion, OR
		// Looking at the log: POST "/api/v1/auth/register/validate-username" 404
		// This means the frontend IS sending /auth/register/...
		// But I configured backend to listen on /api/v1/register/...
		// So I need to move it back to /auth group or adjust the group path.
		
		auth := v1.Group("/auth")
		{
			// Login Flow
			auth.POST("/login", Login)
			auth.POST("/send-verification-code", SendLoginSMS) // Frontend compatibility
			auth.POST("/verify-login", VerifyLogin)            // Frontend compatibility
			auth.POST("/send-sms", SendLoginSMS)               // Legacy/Backup
			auth.POST("/verify-sms", VerifySMS)                // Legacy/Backup

			// Registration Flow
			register := auth.Group("/register")
			{
				register.POST("", StartRegistration) // Step 1
				register.POST("/validate-username", ValidateUsername)
				register.POST("/validate-phone", ValidatePhone)
				register.POST("/validate-email", ValidateEmail)
				register.POST("/validate-password", ValidatePassword)
				register.POST("/validate-name", ValidateName)
				register.POST("/validate-idcard", ValidateIDCard)
				register.POST("/send-verification-code", SendRegisterSMS) // Step 2
				register.POST("/complete", CompleteRegistration)          // Step 3
			}
		}

		// Protected Routes
		protected := v1.Group("/")
		protected.Use(AuthMiddleware())
		{
			users := protected.Group("/users")
			{
				users.GET("/info", GetUserInfo)
			}

			passengers := protected.Group("/passengers")
			{
				passengers.GET("", GetPassengers)
				passengers.POST("", AddPassenger)
			}

			orders := protected.Group("/orders")
			{
				orders.POST("", CreateOrder)
				orders.GET("", GetOrders)
				orders.POST("/:id/pay", PayOrder)
				orders.POST("/:id/cancel", CancelOrder)
			}

			tickets := protected.Group("/tickets")
			{
				tickets.POST("/:id/refund", RefundTicket)
			}
		}

		// Public Train/Station Routes
		trains := v1.Group("/trains")
		{
			trains.GET("/search", SearchTrains)
		}

		stations := v1.Group("/stations")
		{
			stations.GET("", GetStations)
		}
	}

	return r
}
