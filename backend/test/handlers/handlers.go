package handlers

import (
	"railway-booking/src/handlers"
)

// 为测试提供的函数别名
var (
	GetOrders       = handlers.GetOrders
	ProcessPayment  = handlers.ProcessPayment
	GetPassengers   = handlers.GetPassengers
	AddPassenger    = handlers.AddPassenger
	UpdatePassenger = handlers.UpdatePassenger
	DeletePassenger = handlers.DeletePassenger
	GetProfile      = handlers.GetProfile
	UpdateProfile   = handlers.UpdateProfile
)

// NewAuthHandler 创建认证处理器
func NewAuthHandler() *handlers.AuthHandler {
	return handlers.NewAuthHandler()
}