# 12306 英文版前端 UI 需求文档（Scenario/Given/When/Then）

## 1. 总览与导航关系
- 目标：复现英文版的四个主要页面：`Home`（主页）、`Booking`（余票查询）、`Login`（登录）、`Register`（注册）。
- 顶部统一导航：左侧 Logo 与主导航（`Home`、`Booking`、`Travel guides`），右侧快捷入口（`Login`、`Register`、`My 12306`、语言切换 `简体中文`、`Contact us`）。
- 页面关系：
  - 主页点击导航中的 `Booking` 或首页搜索区的 `Search`，进入余票查询页面。
  - 主页右上角 `Login`、`Register` 分别进入登录与注册页面。
  - 余票页点击某车次的 `Book`：未登录时跳转到登录页；登录后进入后续预订流程（不在本文范围）。
- 文案语言：页面主文案与控件标签为英文；必要提示可采用简明英文。
- 视觉一致性：统一的白底卡片、橙色主按钮、浅灰提示区、蓝色导航条。

## 2. 主页（Home）
### 2.1 页面结构
- 顶部导航条：`Home` 高亮；`Booking` 下拉保留但无需展开交互；右上角显示 `Login`、`Register`、`My 12306`、`简体中文`、`Contact us`。
- 轮播区：展示高速列车横幅图；可左右切换（圆点指示），无需自动播放控制说明。
- 中央搜索卡片：
  - 表单字段：`From`（出发站，下拉/输入）、`To`（到达站，下拉/输入）、`Date`（日期选择器），可选勾选框：`High-speed trains only`。
  - 主按钮：`Search`（橙色）。
  - 提示文案：网站服务时间说明（只读）。
- 底部 `Quick Guide`：三列要点链接（如 `What ID documents...`、`What is endorsement?`、`What are the rules...`），右侧 `More` 链接。

### 2.2 基础交互
- Scenario: 初次进入首页
  - Given 用户访问英文版首页
  - When 页面加载完成
  - Then 顶部导航与搜索卡片完整呈现，`Home` 高亮；日期默认选中今天或最近可选日。
- Scenario: 输入并搜索车票
  - Given 用户在搜索卡片填写 `From`、`To`、`Date`
  - When 点击 `Search`
  - Then 进行条件校验（站点不相同、日期在允许范围内），校验通过则跳转至余票页并携带查询条件。
- Scenario: 勾选仅看高铁
  - Given 用户在搜索卡片勾选 `High-speed trains only`
  - When 点击 `Search`
  - Then 跳转余票页，并在过滤条件中同步启用仅高铁筛选。
- Scenario: 通过导航进入 Booking
  - Given 用户位于首页
  - When 点击导航条 `Booking`
  - Then 跳转余票页；若首页已填写条件则携带；未填写则使用默认空条件。
- Scenario: 进入登录/注册
  - Given 用户位于首页
  - When 点击右上角 `Login` 或 `Register`
  - Then 分别跳转到登录或注册页面。

### 2.3 校验与异常（首页）
- Scenario: 出发与到达相同
  - Given `From` 与 `To` 站点相同
  - When 点击 `Search`
  - Then 在对应字段下方显示错误提示 `Departure and destination cannot be the same`，阻止跳转。
- Scenario: 日期超出范围
  - Given 选择日期超出系统可查询范围（参考 14 天内）
  - When 点击 `Search`
  - Then 显示错误提示 `Date is out of query range`，阻止跳转。
- Scenario: 字段未填写完整
  - Given 任一必填字段为空
  - When 点击 `Search`
  - Then 在空字段处显示 `This field is required` 并保持在本页。
- Scenario: 网络异常
  - Given 页面资源或站点列表加载失败
  - When 用户尝试搜索
  - Then 展示 `Network error, please try again`，保留已填信息并允许重试。

## 3. 余票查询（Booking / Left Ticket）
### 3.1 页面结构
- 顶部导航与首页一致；右上角 `Login`、`Register` 可用。
- 顶部查询条（横向表单）：`From`、`To`、`Date`、`Search` 按钮；日期条（日历切片）用于切换相邻 5 天。
- 左侧过滤区 `Filter`：
  - `Train type`（复选项：`All`、`G/C/D`、`Other`），默认选中 `All`。
  - `From Station` 与 `To Station`（单选，`All` 或当前城市），默认 `All`。
  - `Departure Time`（时间区间选择，默认 `00:00–24:00`）。
- 结果列表区（表格卡片）：
  - 列：`Train No.`、`Departure time`、`Travel time`、`Arrival time`、`Price` 与各席别余票；每行右侧含 `Book` 按钮或 `Sold out` 标签。
  - 行内可显示经停信息展开箭头（可选）。
- 底部 `Tips`：票价说明与提示。

### 3.2 进入与回填
- Scenario: 从首页跳转
  - Given 用户在首页点击 `Search`
  - When 进入余票页
  - Then `From/To/Date` 自动回填为首页所填值，并立即触发一次查询。
- Scenario: 直接点击导航 `Booking`
  - Given 用户在任意页点击导航 `Booking`
  - When 进入余票页
  - Then 显示空条件或默认条件（站点为空、日期为今天）；用户可自行填写并查询。

### 3.3 查询与过滤
- Scenario: 修改条件重新查询
  - Given 用户修改 `From/To/Date`
  - When 点击 `Search`
  - Then 刷新列表，展示匹配车次；保留左侧过滤选择。
- Scenario: 切换日期条
  - Given 用户查看日期条
  - When 点击相邻日期（如 `Nov 14`）
  - Then 自动以新日期重新查询并刷新结果。
- Scenario: 筛选列车类型
  - Given 用户在 `Train type` 勾选 `G/C/D`
  - When 条件变更
  - Then 仅显示高铁/动车/城际相关车次；若无结果，提示 `No trains match your filters`。
- Scenario: 筛选出发时段
  - Given 用户设置 `Departure Time` 区间
  - When 条件变更
  - Then 仅显示在区间内发车的车次。

### 3.4 结果与预订按钮
- Scenario: 显示售罄状态
  - Given 某席别余票为 0
  - When 渲染结果行
  - Then 在该席别处显示 `Sold out` 并禁用对应 `Book`；若全部席别为 0，则该行右侧显示整体 `Sold out`。
- Scenario: 点击预订（未登录）
  - Given 用户未登录
  - When 点击行内 `Book`
  - Then 跳转至登录页，并携带当前车次/区间信息（用于登录后返回）。
- Scenario: 点击预订（已登录）
  - Given 用户已登录
  - When 点击 `Book`
  - Then 进入后续预订流程页面（不在本文范围），并显示所选车次的详细信息。

### 3.5 异常与空态（余票页）
- Scenario: 查询无结果
  - Given 条件或过滤过于严格
  - When 完成查询
  - Then 展示空态卡片：`No available trains for the selected date or filters`，保留用户条件。
- Scenario: 网络异常
  - Given 后端接口超时或失败
  - When 完成查询
  - Then 显示 `Service is busy, please try again`，保留条件并允许 `Retry`。

## 4. 登录（Login）
### 4.1 页面结构
- 顶部导航与首页一致。
- 右侧登录卡片（居中偏右）：
  - 输入框：`Email/Username/Mobile number`、`Password`（密码隐藏）。
  - 辅助链接：`Forget your password`（打开找回密码流程占位）。
  - 主按钮：`LOGIN`（橙色，全宽）。
  - 次要文案：`No account yet? Register now!`（跳转注册页）。
  - 底部说明：网站服务与改签规则简述（只读）。

### 4.2 交互与校验
- Scenario: 有效凭据登录
  - Given 用户正确填写账号与密码
  - When 点击 `LOGIN`
  - Then 显示加载状态，验证成功后跳转至来源页（如余票页）或首页；右上角展示登录态入口（`My 12306`）。
- Scenario: 无效凭据
  - Given 用户输入错误的账号或密码
  - When 点击 `LOGIN`
  - Then 在表单顶部或密码下方显示错误 `Invalid credentials`，不跳转。
- Scenario: 必填项为空
  - Given 任一输入框为空
  - When 点击 `LOGIN`
  - Then 在对应输入框下显示 `This field is required`，按钮保持可点击但校验阻止提交。
- Scenario: 按键提交
  - Given 用户焦点在密码框
  - When 按 `Enter`
  - Then 行为等同于点击 `LOGIN`。
- Scenario: 从预订流程返回
  - Given 用户因未登录从余票页点击 `Book` 被重定向到登录页
  - When 登录成功
  - Then 自动跳回之前的车次预订流程入口。

## 5. 注册（Register / Create an account）
### 5.1 页面结构
- 顶部导航与首页一致；面包屑 `HOME > Create an account`。
- 注册表单卡片：
  - `Nationality`（下拉，默认 `Please select`；当前仅支持 foreign passport）。
  - `Name`。
  - `Passport number`。
  - `Passport expiration date`（日期选择器）。
  - `Date of birth`（日期选择器）。
  - `Gender`（`Male`/`Female` 单选）。
  - `Username`。
  - `Password`、`Confirm Password`。
  - `Email address`。
  - 服务条款勾选：`I have read and agree...`（必选）。
  - 主按钮：`Next step`（橙色，全宽）。
  - 辅助提示：护照填写规则链接与邮件通知说明。

### 5.2 校验与交互
- Scenario: 成功注册
  - Given 用户填写所有必填字段、密码一致并勾选条款
  - When 点击 `Next step`
  - Then 展示成功提示或进入下一步资料完善（占位）；可引导跳转登录页。
- Scenario: 必填项缺失
  - Given 任一必填字段为空
  - When 点击 `Next step`
  - Then 在字段下显示 `This field is required` 并阻止继续。
- Scenario: 护照规则校验
  - Given 用户填写 `Passport number/expiration`
  - When 失焦或提交
  - Then 校验格式与有效期（不可早于当前日期），错误时提示 `Invalid passport information`。
- Scenario: 密码一致性
  - Given 用户填写 `Password` 与 `Confirm Password`
  - When 失焦或提交
  - Then 若不一致提示 `Passwords do not match`；满足复杂度（长度≥8，含字母数字），否则提示 `Password is too weak`。
- Scenario: 用户名/邮箱唯一性
  - Given 用户填写 `Username/Email`
  - When 提交
  - Then 若占用则提示 `Already taken` 或 `Email already registered`。
- Scenario: 未勾选条款
  - Given 用户未勾选 `I agree`
  - When 点击 `Next step`
  - Then 在勾选框下方提示 `You must agree to continue`。

## 6. 一致性与可用性要求
- 响应式：桌面宽屏下卡片居中；窄屏时表单全宽堆叠，导航折叠为汉堡菜单（可为占位要求）。
- 访问性：输入框与按钮具备可聚焦状态；键盘操作可完成主要流程；图片需提供 `alt` 文本。
- 状态反馈：主按钮点击显示加载动画；错误提示贴近字段；成功操作显示轻量提示。
- 禁用逻辑：在必填项未满足时，按钮可点击但由前端校验阻止提交并给出提示；或根据设计可禁用（任选其一，需全站一致）。
- 站点列表：站点输入支持下拉与模糊匹配；同名城市显示中英文（如 `Beijing(北京)`）。
- 日期范围：遵循统一规则（参考 `requirements.md` 中 14 天内）。

## 7. 事件追踪（可选占位）
- 记录关键交互：`Search` 点击、`Book` 点击、登录成功/失败、注册成功/失败、过滤条件变更。
- 埋点字段：时间戳、来源页面、查询条件、结果数量、错误代码。

## 8. 未来页面占位
- `My 12306`：登录后个人中心与订单入口（与主需求文档对齐）。
- `Travel guides`：旅行指南文章列表与详情。
- `Contact us`：客服渠道与常见问题。
- `Password recovery`：找回密码流程。
- `Ticket booking flow`：选择乘车人、座位与支付的详细 UI（另行文档）。

## 9. 非功能性要求
- 性能：首屏关键资源加载时间可控；表单交互无明显卡顿。
- 安全：不在前端持久化密码；登录接口调用使用安全传输；对错误信息做通用兜底。
- 国际化：英文明文案统一，日期与数字格式采用英文站点常用格式。
