package routes

import (
	"railway-booking/src/handlers"
	"railway-booking/src/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB, jwtSecret string) *gin.Engine {
	r := gin.Default()

	// 添加CORS中间件
	r.Use(middleware.CORSMiddleware())

	// Initialize handlers with dependencies
	authHandler := &handlers.AuthHandler{DB: db, JWTSecret: jwtSecret}
	userHandler := &handlers.UserHandler{DB: db}
	passengerHandler := &handlers.PassengerHandler{DB: db}
	orderHandler := &handlers.OrderHandler{DB: db}

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Authentication routes
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/logout", authHandler.Logout)
		}

		// Protected routes (require authentication)
		protected := v1.Group("/")
		protected.Use(middleware.JWTAuthMiddleware(jwtSecret))
		{
			// User profile routes
			user := protected.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)
				user.PUT("/profile", userHandler.UpdateProfile)
				user.POST("/change-password", userHandler.ChangePassword)
			}

			// Passenger management routes
			passengers := protected.Group("/passengers")
			{
				passengers.GET("", passengerHandler.GetPassengers)
				passengers.POST("", passengerHandler.AddPassenger)
				passengers.PUT("/:id", passengerHandler.UpdatePassenger)
				passengers.DELETE("/:id", passengerHandler.DeletePassenger)
			}

			// Order management routes
			orders := protected.Group("/orders")
			{
				orders.GET("", orderHandler.GetOrders)
				orders.POST("", orderHandler.CreateOrder)
				orders.GET("/:id", orderHandler.GetOrderDetail)
				orders.POST("/:id/pay", orderHandler.PayOrder)
				orders.POST("/:id/cancel", orderHandler.CancelOrder)
			}
		}
	}

	return r
}