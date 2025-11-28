package main

import (
	"12306-backend/routes"
)

func main() {
	r := routes.SetupRouter()
	r.Run(":8080")
}
