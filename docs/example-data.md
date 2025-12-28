# 示例数据与使用说明

## 可用站点
- `BJP` Beijing / 北京 / `beijing`
- `SHH` Shanghai / 上海 / `shanghai`
- `GZQ` Guangzhou / 广州 / `guangzhou`
- `SZH` Shenzhen / 深圳 / `shenzhen`
- `HZH` Hangzhou / 杭州 / `hangzhou`
- `NJH` Nanjing / 南京 / `nanjing`
- `XAY` Xi'an / 西安 / `xian`
- `WHN` Wuhan / 武汉 / `wuhan`
- `CDW` Chengdu / 成都 / `chengdu`
- `HKG` Hong Kong West Kowloon / 香港西九龙 / `xianggangxijiulong`

## 可用车次（当日）

### 北京 (BJP) <-> 上海 (SHH)
- `G1` 北京→上海（07:00 - 11:30）席别：二等、一等、商务、特等
- `D5` 北京→上海（07:21 - 09:27）席别：二等、一等、软卧
- `G2` 北京→上海（08:00 - 12:20）席别：二等、一等、商务
- `D6` 北京→上海（09:00 - 11:12）席别：二等、一等
- `K1` 北京→上海（19:00 - 07:10+1）席别：硬座、硬卧、软卧

### 上海 (SHH) <-> 杭州 (HZH)
- `C1` 上海→杭州（08:00 - 09:00）席别：二等、一等、商务
- `C2` 上海→杭州（09:30 - 10:30）席别：二等、一等、商务

### 广州 (GZQ) <-> 深圳 (SZH)
- `G100` 广州→深圳（10:00 - 10:40）席别：二等、一等、商务
- `G101` 广州→深圳（10:20 - 11:00）席别：二等、一等、商务
- `G201` 广州→深圳（09:40 - 10:20）席别：二等、一等、商务

### 南京 (NJH) <-> 杭州 (HZH)
- `D300` 南京→杭州（12:00 - 14:20）席别：二等、一等
- `D301` 南京→杭州（12:30 - 14:50）席别：二等、一等
- `D302` 南京→杭州（13:00 - 15:15）席别：二等、一等

### 北京 (BJP) <-> 西安 (XAY)
- `Z50` 北京→西安（13:00 - 20:00）席别：硬座、硬卧、软卧
- `Z51` 北京→西安（14:00 - 21:00）席别：硬座、硬卧、软卧

### 武汉 (WHN) <-> 成都 (CDW)
- `K80` 武汉→成都（09:30 - 16:50）席别：硬座、硬卧、软卧
- `K81` 武汉→成都（10:00 - 17:20）席别：硬座、硬卧、软卧

### 北京 (BJP) <-> 成都 (CDW)
- `G301` 北京→成都（07:10 - 15:30）席别：二等、一等、商务
- `G303` 北京→成都（08:20 - 16:40）席别：二等、一等、商务
- `D701` 北京→成都（09:00 - 18:30）席别：二等、一等、软卧
- `Z151` 北京→成都（20:20 - 07:40+1）席别：硬座、硬卧、软卧

### 香港西九龙 (HKG) <-> 上海 (SHH)
- `G102` 香港西九龙→上海（11:00 - 19:30）经停：深圳、广州、杭州
- `G104` 香港西九龙→上海（13:00 - 21:30）经停：深圳、广州、杭州
- `G99` 上海→香港西九龙（14:10 - 22:38）经停：杭州、广州、深圳
- `G103` 上海→香港西九龙（08:00 - 16:28）经停：杭州、广州、深圳

以上车次均为当日 `current_date` 服务，库存与价格已初始化。

## 后端如何调取
- 站点搜索：`GET /api/v1/stations?q=<keyword>`
  - 关键词支持：英文名（如 `Beijing`）、拼音（如 `beijing`）、站码（如 `BJP`）
- 列车查询：`GET /api/v1/trains/search`
  - 必填参数：`fromStationId`、`toStationId`、`date`
  - 可选参数：`departTimeStart`、`departTimeEnd`、`highSpeedOnly`
  - 示例（北京→上海）：
    - 先查站点ID：按 `code='BJP'` 与 `code='SHH'`
    - 查询视图：`v_train_search` 过滤 `from_station_id`、`to_station_id`、`date`

示例 SQL（在容器内 `psql`）：
```sql
SELECT code,name_en FROM stations ORDER BY code LIMIT 20;

SELECT train_no, date, depart_time, arrive_time
FROM v_train_search
WHERE from_station_id=(SELECT id FROM stations WHERE code='BJP')
  AND to_station_id=(SELECT id FROM stations WHERE code='SHH')
ORDER BY depart_time;
```

## 前端如何输入查询
- 在站点输入框，支持以下匹配（不区分大小写）：
  - 英文名：`Beijing`, `Shanghai`, `Guangzhou`, `Shenzhen` 等
  - 拼音：`beijing`, `shanghai`, `guangzhou`, `shenzhen` 等
  - 站码：`BJP`, `SHH`, `GZQ`, `SZH` 等
- 例子：
  - 北京→上海，当日，选择高铁仅：勾选 `High-speed only`，可得到 `G1`/`D5` 等结果
  - 上海→杭州：输入 `Shanghai`、`Hangzhou` 或 `SHH`、`HZH`
  - 广州→深圳：输入 `GZQ`、`SZH` 或英文/拼音

## 视图与后端实现参考
- 统一查询视图：`init-scripts/00-init.sql:188-217` 定义 `v_train_search`
- 查询实现：
  - `backend/internal/repo/repo.go:108-141` 封装查询
  - `backend/internal/server/trains.go:1-54` 处理 `/trains/search` 参数与返回结构

## 注意
- 数据每日初始化为当日服务；若需重新加载脚本，请重新创建数据库卷并启动容器。