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

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(CORSMiddleware())

	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", Register)
			auth.POST("/register/complete", CompleteRegistration)
			auth.POST("/login", Login)
			auth.POST("/verify-login", VerifyLogin)
			auth.POST("/send-sms", SendSMS)
			auth.POST("/verify-sms", VerifySMS)
		}

		passengers := v1.Group("/passengers")
		{
			passengers.GET("", GetPassengers)
			passengers.POST("", AddPassenger)
			passengers.PUT("/:id", UpdatePassenger)
			passengers.DELETE("/:id", DeletePassenger)
		}

		trains := v1.Group("/trains")
		{
			trains.GET("/search", SearchTrains)
		}

		stations := v1.Group("/stations")
		{
			stations.GET("", GetStations)
		}

		orders := v1.Group("/orders")
		{
			orders.POST("", CreateOrder)
			orders.GET("", GetOrders)
			orders.GET("/new", GetOrderPageData)
			orders.GET("/:id/confirmation", GetOrderConfirmation)      // Add this
			orders.GET("/:id/payment", GetPaymentInfo)                 // Add this
			orders.GET("/:id/time-remaining", GetPaymentTimeRemaining) // Add this
			orders.POST("/:id/confirm", ConfirmOrder)                  // Add this
			orders.POST("/:id/pay", PayOrder)
			orders.POST("/:id/cancel", CancelOrder)
		}

		users := v1.Group("/users")
		{
			users.GET("/info", GetUserInfo)
		}

		tickets := v1.Group("/tickets")
		{
			tickets.POST("/:id/refund", RefundTicket)
		}
	}

	return r
}
