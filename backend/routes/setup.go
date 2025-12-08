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
		auth := v1.Group("/auth")
		{
			auth.POST("/register", Register)
			auth.POST("/login", Login)
			auth.POST("/send-sms", SendLoginSMS) // Updated for 2FA Login
			auth.POST("/verify-sms", VerifySMS)
		}

		// Protected Routes
		protected := v1.Group("/")
		protected.Use(AuthMiddleware())
		{
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

		trains := v1.Group("/trains")
		{
			trains.GET("/search", SearchTrains)
		}
	}

	return r
}
