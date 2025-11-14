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

## 可用车次（当日）
- `D5` 北京→上海（07:21 出发，09:27 到达）席别：二等、一等、软卧
- `G1` 北京→上海（07:00 出发，11:30 到达）席别：二等、一等、商务
- `C1` 上海→杭州（08:00 出发，09:00 到达）席别：二等、一等、商务
- `G100` 广州→深圳（10:00 出发，10:40 到达）席别：二等、一等、商务
- `D300` 南京→杭州（12:00 出发，14:20 到达）席别：二等、一等
- `Z50` 北京→西安（13:00 出发，20:00 到达）席别：硬座、硬卧、软卧
- `K80` 武汉→成都（09:30 出发，16:50 到达）席别：硬座、硬卧、软卧

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