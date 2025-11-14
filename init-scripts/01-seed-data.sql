INSERT INTO stations(code,name_en,name_zh,pinyin) VALUES
('BJP','Beijing','北京','beijing'),
('SHH','Shanghai','上海','shanghai'),
('GZQ','Guangzhou','广州','guangzhou'),
('SZH','Shenzhen','深圳','shenzhen'),
('HZH','Hangzhou','杭州','hangzhou'),
('NJH','Nanjing','南京','nanjing'),
('XAY','Xi''an','西安','xian'),
('WHN','Wuhan','武汉','wuhan'),
('CDW','Chengdu','成都','chengdu')
ON CONFLICT (code) DO UPDATE SET name_en=EXCLUDED.name_en,name_zh=EXCLUDED.name_zh,pinyin=EXCLUDED.pinyin;

INSERT INTO trains(train_no,train_type) VALUES
('D5','D'),
('G1','G'),
('C1','C'),
('G100','G'),
('D300','D'),
('Z50','Z'),
('K80','K'),
('G2','G'),
('D6','D'),
('C2','C'),
('G201','G'),
('G101','G'),
('D301','D'),
('D302','D'),
('Z51','Z'),
('K81','K')
ON CONFLICT (train_no) DO UPDATE SET train_type=EXCLUDED.train_type;