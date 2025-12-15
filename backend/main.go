package main

import (
	"12306-backend/db"
	"12306-backend/routes"
	"12306-backend/services"
)

func main() {
    db.Init()
    
    // Initialize train schedule (New Requirement: Auto-seed next 14 days and cleanup old)
    services.InitTrainSchedule()

    r := routes.SetupRouter()
    r.Run(":8081")
}
