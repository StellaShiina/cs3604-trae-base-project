package main

import (
	"12306-backend/db"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=railway12306 port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	}

	d, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	db.DB = d // Mock init if needed, but we just use 'd'

	// List tables
	var tables []string
	d.Raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").Scan(&tables)
	fmt.Println("Tables:", tables)

	// Check columns of train_services (if exists)
	for _, t := range tables {
		if t == "service_segments" {
			var columns []struct {
				ColumnName string
				DataType   string
			}
			d.Raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ?", t).Scan(&columns)
			fmt.Printf("Table %s columns: %+v\n", t, columns)
		}
	}

	// Check foreign key definition for orders.train_service_id
	var fkInfo []struct {
		ConstraintName    string
		TableName         string
		ColumnName        string
		ForeignTableName  string
		ForeignColumnName string
	}
	d.Raw(`
        SELECT
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name, 
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu 
              ON tc.constraint_name = kcu.constraint_name 
              AND tc.table_schema = kcu.table_schema 
            JOIN information_schema.constraint_column_usage AS ccu 
              ON ccu.constraint_name = tc.constraint_name 
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='orders';
    `).Scan(&fkInfo)
	fmt.Printf("FK Info: %+v\n", fkInfo)
}
