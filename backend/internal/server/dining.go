package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) diningRoutes(v1 *gin.RouterGroup) {
	dining := v1.Group("/dining")
	dining.GET("/products", s.getDiningProducts)
	dining.GET("/merchants", s.getDiningMerchants)
	dining.GET("/merchants/:id", s.getDiningMerchantDetail)
}

// GET /api/v1/dining/products - 列车自营商品
func (s *Server) getDiningProducts(c *gin.Context) {
	var products []gin.H
	
	rows, err := s.DB.Raw(`
		SELECT id, name, name_en, price, image, category
		FROM dining_products
		WHERE is_train_product = TRUE
		ORDER BY created_at
	`).Rows()
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer rows.Close()
	
	for rows.Next() {
		var id, name, nameEn, image, category string
		var price float64
		
		if err := rows.Scan(&id, &name, &nameEn, &price, &image, &category); err != nil {
			continue
		}
		
		products = append(products, gin.H{
			"id":       id,
			"name":     name,
			"nameEn":   nameEn,
			"price":    price,
			"image":    image,
			"category": category,
		})
	}
	
	c.JSON(http.StatusOK, products)
}

// GET /api/v1/dining/merchants - 商家列表
func (s *Server) getDiningMerchants(c *gin.Context) {
	trainNo := c.Query("trainNo")
	date := c.Query("date")
	availableOnly := c.Query("availableOnly") == "true"

	if trainNo == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "trainNo and date are required"})
		return
	}

	// 验证车次是否存在
	var trainExists int64
	s.DB.Raw("SELECT COUNT(*) FROM train_services WHERE train_no = ? AND service_date = ?", trainNo, date).Scan(&trainExists)
	
	if trainExists == 0 {
		c.JSON(http.StatusOK, gin.H{
			"merchants": []gin.H{},
			"query": gin.H{
				"trainNo": trainNo,
				"date":    date,
			},
			"message": "Train not found or not in service on this date",
		})
		return
	}

	var merchants []gin.H
	
	// 构建查询：获取该车次所有经停站的商家
	query := `
		SELECT 
			dm.id,
			dm.name,
			dm.name_en,
			dm.logo,
			dm.status,
			dm.min_order,
			dm.delivery_fee,
			dm.open_time,
			dm.rating,
			dm.phone,
			s.name_zh as station,
			s.name_en as station_en,
			MIN(ss.stop_seq) as stop_seq,
			CASE 
				WHEN MAX(ss.depart_time) IS NOT NULL 
				THEN TO_CHAR(ts.service_date, 'MM-DD') || ' ' || TO_CHAR(MAX(ss.depart_time), 'HH24:MI')
				ELSE ''
			END as departure_time
		FROM dining_merchants dm
		JOIN stations s ON dm.station_id = s.id
		JOIN service_stops ss ON ss.station_id = s.id
		JOIN train_services ts ON ss.train_service_id = ts.id
		WHERE ts.train_no = ?
		AND ts.service_date = ?
	`
	
	args := []interface{}{trainNo, date}
	
	if availableOnly {
		query += " AND dm.status = 'available'"
	}
	
	query += " GROUP BY dm.id, dm.name, dm.name_en, dm.logo, dm.status, dm.min_order, dm.delivery_fee, dm.open_time, dm.rating, dm.phone, s.name_zh, s.name_en, ts.service_date ORDER BY stop_seq"
	
	rows, err := s.DB.Raw(query, args...).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch merchants"})
		return
	}
	defer rows.Close()
	
	for rows.Next() {
		var id, name, nameEn, logo, status, openTime, phone, station, stationEn, departureTime string
		var minOrder, deliveryFee, rating float64
		var stopSeq int
		
		if err := rows.Scan(&id, &name, &nameEn, &logo, &status, &minOrder, &deliveryFee, &openTime, &rating, &phone, &station, &stationEn, &stopSeq, &departureTime); err != nil {
			continue
		}
		
		merchants = append(merchants, gin.H{
			"id":               id,
			"name":             name,
			"nameEn":           nameEn,
			"logo":             logo,
			"status":           status,
			"minOrder":         minOrder,
			"deliveryFee":      deliveryFee,
			"openTime":         openTime,
			"rating":           rating,
			"phone":            phone,
			"station":          station,
			"stationEn":        stationEn,
			"departureTime":    departureTime,
			"boardingDeadline": "Boarding 30 mins before departure",
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"merchants": merchants,
		"query": gin.H{
			"trainNo": trainNo,
			"date":    date,
		},
	})
}

// GET /api/v1/dining/merchants/:id - 商家详情
func (s *Server) getDiningMerchantDetail(c *gin.Context) {
	id := c.Param("id")

	// 获取商家信息
	var merchant gin.H
	var merchantId, name, nameEn, logo, status, openTime, phone, station, stationEn string
	var minOrder, deliveryFee, rating float64
	
	err := s.DB.Raw(`
		SELECT 
			dm.id, dm.name, dm.name_en, dm.logo, dm.status,
			dm.min_order, dm.delivery_fee, dm.open_time, dm.rating, dm.phone,
			s.name_zh as station, s.name_en as station_en
		FROM dining_merchants dm
		JOIN stations s ON dm.station_id = s.id
		WHERE dm.id = ?
	`, id).Row().Scan(&merchantId, &name, &nameEn, &logo, &status, &minOrder, &deliveryFee, &openTime, &rating, &phone, &station, &stationEn)
	
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Merchant not found"})
		return
	}
	
	merchant = gin.H{
		"id":                  merchantId,
		"name":                name,
		"nameEn":              nameEn,
		"logo":                logo,
		"status":              status,
		"minOrder":            minOrder,
		"deliveryFee":         deliveryFee,
		"openTime":            openTime,
		"rating":              rating,
		"phone":               phone,
		"station":             station,
		"stationEn":           stationEn,
		"boardingDeadline":    "30 mins before departure",
		"alightingDeadline":   "30 mins before arrival",
	}
	
	// 获取商家的商品
	var products []gin.H
	rows, err := s.DB.Raw(`
		SELECT id, name, name_en, price, category, image
		FROM dining_products
		WHERE merchant_id = ?
		ORDER BY category, name
	`, id).Rows()
	
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var prodId, prodName, prodNameEn, category, image string
			var price float64
			
			if err := rows.Scan(&prodId, &prodName, &prodNameEn, &price, &category, &image); err != nil {
				continue
			}
			
			products = append(products, gin.H{
				"id":       prodId,
				"name":     prodName,
				"nameEn":   prodNameEn,
				"price":    price,
				"category": category,
				"image":    image,
			})
		}
	}
	
	merchant["products"] = products
	
	c.JSON(http.StatusOK, merchant)
}

