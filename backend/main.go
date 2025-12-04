package main

import (
    "12306-backend/db"
    "12306-backend/routes"
)

func main() {
    db.Init()
    r := routes.SetupRouter()
    r.Run(":8080")
}
