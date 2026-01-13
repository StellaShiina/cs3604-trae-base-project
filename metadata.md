> 本文档是项目的唯一真理来源（Single Source of Truth）。所有的代码生成、接口设计和文件结构必须严格遵守本文档定义的规范。

## 1. Tech Stack & Dependencies (技术栈约束)

必须严格使用以下技术栈:

### Frontend (Client)

  * Framework: React 18+ (created via Vite)
  * Language: JavaScript (ES6+)
  * Styling: 传统CSS (不使用Tailwind CSS)
  * HTTP Client: Axios
  * Routing: React Router DOM (v6)
  * Testing: Vitest, React Testing Library (RTL)

### Backend (Server)

  * Runtime: Node.js (LTS)
  * Framework: Express.js
  * Database: SQLite3 (使用 `sqlite3` driver)
  * Testing: Vitest (Test Runner), Supertest (HTTP assertions)
  * Utilities: Nodemon (dev), Cors, Body-parser

-----

## 2. Project Directory Structure (目录结构规范)

在生成文件时，必须严格遵循此树状结构。

```text
/root
├── /backend
│   ├── /src
│   │   ├── /database
│   │   │   ├── init_db.js
│   │   │   ├── db.js
│   │   │   └── operations.js
│   │   ├── /routes
│   │   │   └── api.js
│   │   ├── /utils
│   │   │   └── response.js
│   │   └── index.js
│   ├── /test
│   │   └── ...                  # 结构与 src 镜像，命名遵循 *.test.*
│   ├── database.db
│   └── package.json
│
├── /frontend
│   ├── /src
│   │   ├── /api
│   │   │   └── index.js
│   │   ├── /components
│   │   ├── /pages
│   │   │   ├── HomePage.jsx
│   │   │   └── HomePage.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── /test
│   │   └── ...                  # 结构与 src 镜像，命名遵循 *.test.*
│   └── package.json
│
└── metadata.md
```

### Testing (测试规范)
#### 测试文件命名
- 所有测试文件必须位于与 `src` 同级的 `test` 目录下，且目录结构与 `src` 镜像对应。
- 测试文件命名必须与被测文件名称相同，并在扩展名前添加 `.test`。
- 示例：
  - 被测文件：`frontend/src/pages/HomePage.jsx` → 测试文件：`frontend/test/pages/HomePage.test.jsx`
  - 被测文件：`backend/src/routes/api.js` → 测试文件：`backend/test/routes/api.test.js`

#### 测试流程
所有测试必须遵循以下代码规范，以实现前后端连通：
##### 1. Backend API & Logic Tests
* **工具**: `vitest`, `supertest`
* **环境**: Node.js Environment
* **数据库**: 每个测试文件运行前重置 SQLite 内存数据库或测试数据库文件。
#### 2. Frontend Full-Stack Tests
* **工具**: `vitest`, `@testing-library/react`
* **原则**: **No Mocks (Real Backend)**, **No Conditional Skipping**, **Data & UI Assertion**.
  *Agent 注意：必须严格照搬以下 Setup/Teardown 逻辑，严禁使用 if (input) return 跳过测试。*
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// [IMPORTS] 必须根据项目实际路径调整
import app from '../../../backend/src/index'; 
import db from '../../../backend/src/database/db'; 
import TargetComponent from '../../src/pages/TargetComponent'; // 待测组件

// [GLOBALS] 用于保存服务器实例和拦截的数据
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <TargetComponent />', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    // 启动真实后端 (Port 0 = Random Port)
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    // 配置 Axios 指向该测试服务器
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    // [CRITICAL] 安装透明拦截器，捕获真实响应数据
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; // 捕获数据用于断言
      return response; // 放行数据给组件
    });
  });

  afterAll((done) => server?.close(done));

  // ================= 2. Lifecycle: Data Seeding & Mocks =================
  beforeEach(async () => {
    lastApiResponse = null; // 重置捕获器
    
    // Mock window.location (防止 JSDOM 跳转报错，并允许断言跳转)
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // [Database Seeding] 
    // 1. 清理脏数据
    await db.run('DELETE FROM relevant_table');
    // 2. 预置测试所需数据 (根据当前测试需求修改 SQL)
    // await db.run("INSERT INTO relevant_table (col1, col2) VALUES ('val1', 'val2')");
  });

  // ================= 3. Test Cases: 3-Layer Validation =================
  
  // Layer 1: 基本渲染测试
  it('renders initial UI elements correctly', () => {
    render(<BrowserRouter><TargetComponent /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /提交/i })).toBeInTheDocument();
  });

  // Layer 2 & 3: 交互、数据正确性、UI响应
  it('performs action, validates backend data, and updates UI state', async () => {
    render(<BrowserRouter><TargetComponent /></BrowserRouter>);

    // A. 模拟交互 (Interaction)
    // fireEvent.change(screen.getByPlaceholderText(/Input/), { target: { value: 'data' } });
    fireEvent.click(screen.getByRole('button', { name: /提交/i }));

    // B. 等待并验证 (Wait & Verify)
    await waitFor(() => {
      // Check 1: Data Correctness (后端返回了什么？)
      // 验证后端逻辑执行正确，且返回格式符合契约
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse).toMatchObject({
        // expected_field: 'expected_value'
      });

      // Check 2: UI/State Side Effects (前端变成了什么？)
      // 验证前端正确消费了数据
      // Case A: 路由跳转
      // expect(window.location.href).toContain('/next-page');
      // Case B: 界面更新
      // expect(screen.getByText(/操作成功/i)).toBeInTheDocument();
    });
  });
});
```
## 3. Start the Application (启动应用)

- Frontend：在 `frontend` 目录下，执行 `npm run dev` 启动开发服务器，运行在localhost:5173。
- Backend：在 `backend` 目录下，执行 `npm run dev` 启动开发服务器，运行在localhost:3000。
