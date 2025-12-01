-- 餐饮商家表
CREATE TABLE IF NOT EXISTS dining_merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES stations(id),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    logo TEXT,
    status TEXT NOT NULL DEFAULT 'available', -- available, closed
    min_order DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    open_time TEXT, -- e.g., "10:00-20:00"
    rating DECIMAL(3, 2) DEFAULT 4.0,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商品表
CREATE TABLE IF NOT EXISTS dining_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES dining_merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT, -- new, hot, sandwich, snacks, dessert, drinks
    image TEXT,
    is_train_product BOOLEAN DEFAULT FALSE, -- 是否为列车自营商品
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_dining_merchants_station ON dining_merchants(station_id);
CREATE INDEX IF NOT EXISTS idx_dining_products_merchant ON dining_products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_dining_products_train ON dining_products(is_train_product) WHERE is_train_product = TRUE;

-- 插入列车自营商品
INSERT INTO dining_products (name, name_en, price, image, is_train_product, category) VALUES
('青岛啤酒通道单头', 'Tsingtao Beer', 20.00, 'https://via.placeholder.com/150?text=Beer', TRUE, 'drinks'),
('依云矿泉水', 'Evian Water', 13.00, 'https://via.placeholder.com/150?text=Water', TRUE, 'drinks'),
('杏鲍菇绿牛肉套餐', 'Mushroom Beef Set', 68.00, 'https://via.placeholder.com/150?text=Meal', TRUE, 'hot')
ON CONFLICT DO NOTHING;

-- 为北京站插入商家
DO $$
DECLARE
    beijing_id UUID;
    merchant_kfc UUID;
    merchant_subway UUID;
    merchant_jingtiemeishi UUID;
BEGIN
    -- 获取北京站点ID
    SELECT id INTO beijing_id FROM stations WHERE code = 'BJP' LIMIT 1;
    
    IF beijing_id IS NOT NULL THEN
        -- 插入肯德基
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (beijing_id, '肯德基（北京站）', 'KFC (Beijing)', 'https://via.placeholder.com/80?text=KFC', 'available', 0.00, 8.00, '10:00-20:00', 4.5, '010-12345678')
        RETURNING id INTO merchant_kfc;
        
        -- 为KFC插入商品
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_kfc, '冰美式甜品2件套', 'Iced Americano & Dessert Set', 26.50, 'new', 'https://via.placeholder.com/150?text=Set1'),
        (merchant_kfc, '热美式甜品2件套', 'Hot Americano & Dessert Set', 26.00, 'new', 'https://via.placeholder.com/150?text=Set2'),
        (merchant_kfc, '热拿铁甜品2件套', 'Hot Latte & Dessert Set', 28.50, 'new', 'https://via.placeholder.com/150?text=Set3'),
        (merchant_kfc, '黄金鸡块(5块)', 'Chicken Nuggets (5pcs)', 15.00, 'snacks', 'https://via.placeholder.com/150?text=Nuggets'),
        (merchant_kfc, '原味鸡(1块)', 'Original Recipe Chicken', 12.00, 'hot', 'https://via.placeholder.com/150?text=Chicken'),
        (merchant_kfc, '葡式蛋挞', 'Portuguese Egg Tart', 8.50, 'dessert', 'https://via.placeholder.com/150?text=Tart');
        
        -- 插入赛百味
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (beijing_id, '赛百味（北京站）', 'Subway (Beijing)', 'https://via.placeholder.com/80?text=Subway', 'available', 0.00, 8.00, '10:00-20:00', 4.3, '010-87654321')
        RETURNING id INTO merchant_subway;
        
        -- 为Subway插入商品
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_subway, '意式经典三明治', 'Italian Classic Sub', 28.00, 'sandwich', 'https://via.placeholder.com/150?text=Sub1'),
        (merchant_subway, '香烤鸡排三明治', 'Roasted Chicken Sub', 30.00, 'sandwich', 'https://via.placeholder.com/150?text=Sub2'),
        (merchant_subway, '金枪鱼三明治', 'Tuna Sub', 32.00, 'sandwich', 'https://via.placeholder.com/150?text=Sub3'),
        (merchant_subway, '蔬菜沙拉', 'Veggie Salad', 22.00, 'sandwich', 'https://via.placeholder.com/150?text=Salad');
        
        -- 插入京铁佳肴
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (beijing_id, '京铁佳肴（北京站）', 'Railway Cuisine (Beijing)', 'https://via.placeholder.com/80?text=Railway', 'available', 0.00, 8.00, '10:00-20:00', 4.6, '010-11223344')
        RETURNING id INTO merchant_jingtiemeishi;
        
        -- 为京铁佳肴插入商品
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_jingtiemeishi, '红烧牛肉面', 'Braised Beef Noodles', 35.00, 'hot', 'https://via.placeholder.com/150?text=Noodle1'),
        (merchant_jingtiemeishi, '酸辣粉', 'Hot and Sour Noodles', 28.00, 'hot', 'https://via.placeholder.com/150?text=Noodle2'),
        (merchant_jingtiemeishi, '鸡腿饭', 'Chicken Leg Rice', 32.00, 'hot', 'https://via.placeholder.com/150?text=Rice');
    END IF;
END $$;

-- 为上海站插入商家
DO $$
DECLARE
    shanghai_id UUID;
    merchant_ygf UUID;
    merchant_mmx UUID;
BEGIN
    -- 获取上海站点ID
    SELECT id INTO shanghai_id FROM stations WHERE code = 'SHH' LIMIT 1;
    
    IF shanghai_id IS NOT NULL THEN
        -- 插入杨国福麻辣烫
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (shanghai_id, '杨国福麻辣烫（上海站）', 'Yang Guo Fu (Shanghai)', 'https://via.placeholder.com/80?text=YGF', 'closed', 0.00, 8.00, '10:00-20:00', 4.2, '021-12345678')
        RETURNING id INTO merchant_ygf;
        
        -- 为杨国福插入商品
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_ygf, '麻辣烫套餐A', 'Spicy Hot Pot Set A', 38.00, 'hot', 'https://via.placeholder.com/150?text=Hotpot1'),
        (merchant_ygf, '麻辣烫套餐B', 'Spicy Hot Pot Set B', 45.00, 'hot', 'https://via.placeholder.com/150?text=Hotpot2'),
        (merchant_ygf, '麻辣烫套餐C', 'Spicy Hot Pot Set C', 52.00, 'hot', 'https://via.placeholder.com/150?text=Hotpot3');
        
        -- 插入嘛嘛香牛肉面
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (shanghai_id, '嘛嘛香牛肉面（上海站）', 'Mama Xiang Beef Noodle (Shanghai)', 'https://via.placeholder.com/80?text=Noodle', 'closed', 0.00, 8.00, '10:00-20:00', 4.1, '021-87654321')
        RETURNING id INTO merchant_mmx;
        
        -- 为嘛嘛香插入商品
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_mmx, '招牌牛肉面', 'Signature Beef Noodles', 32.00, 'hot', 'https://via.placeholder.com/150?text=BeefNoodle'),
        (merchant_mmx, '红烧牛肉面', 'Braised Beef Noodles', 35.00, 'hot', 'https://via.placeholder.com/150?text=Noodle3'),
        (merchant_mmx, '酸菜牛肉面', 'Pickled Cabbage Beef Noodles', 33.00, 'hot', 'https://via.placeholder.com/150?text=Noodle4');
    END IF;
END $$;

-- 为杭州站插入商家
DO $$
DECLARE
    hangzhou_id UUID;
    merchant_dessert UUID;
BEGIN
    SELECT id INTO hangzhou_id FROM stations WHERE code = 'HZH' LIMIT 1;
    
    IF hangzhou_id IS NOT NULL THEN
        INSERT INTO dining_merchants (station_id, name, name_en, logo, status, min_order, delivery_fee, open_time, rating, phone)
        VALUES (hangzhou_id, '书亦烧仙草（杭州站）', 'Shuyi Grass Jelly (Hangzhou)', 'https://via.placeholder.com/80?text=Dessert', 'available', 0.00, 8.00, '10:00-20:00', 4.4, '0571-12345678')
        RETURNING id INTO merchant_dessert;
        
        INSERT INTO dining_products (merchant_id, name, name_en, price, category, image) VALUES
        (merchant_dessert, '招牌烧仙草', 'Signature Grass Jelly', 18.00, 'dessert', 'https://via.placeholder.com/150?text=Jelly1'),
        (merchant_dessert, '奶茶', 'Milk Tea', 15.00, 'drinks', 'https://via.placeholder.com/150?text=Tea'),
        (merchant_dessert, '双拼烧仙草', 'Double Grass Jelly', 22.00, 'dessert', 'https://via.placeholder.com/150?text=Jelly2');
    END IF;
END $$;

