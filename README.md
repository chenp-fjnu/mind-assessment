# 心智测评中心

多平台心理测评与认知训练应用，基于 **UniApp + Vue 3** 跨平台框架，一套代码同时构建 **微信小程序** 与 **H5 网页版**。

## 项目结构

```
心智测验小程序/
├── mind-assessment-uniapp/       # UniApp 跨平台前端（H5 + 小程序）
│   ├── src/
│   │   ├── components/           #   通用组件（FigureView, MatrixView）
│   │   ├── modules/              #   测评模块（14个 TypeScript 模块）+ 模块系统
│   │   ├── pages/                #   页面（17个 Vue 页面）
│   │   │   ├── index/            #     启动页
│   │   │   ├── hub/              #     首页
│   │   │   ├── category/         #     分类浏览
│   │   │   ├── runner/           #     测评答题
│   │   │   ├── report/           #     结果报告
│   │   │   ├── payment/          #     支付页
│   │   │   ├── history/          #     历史记录
│   │   │   ├── login/            #     登录页
│   │   │   ├── privacy/          #     隐私政策
│   │   │   └── games/            #     认知训练游戏（8个）
│   │   ├── stores/               #   Pinia 状态管理（app/user）
│   │   ├── utils/                #   工具函数（auth/http/pay/format/storage等）
│   │   ├── static/               #   静态资源
│   │   ├── App.vue               #   应用根组件
│   │   ├── main.ts               #   应用入口
│   │   ├── manifest.json         #   UniApp 平台配置
│   │   └── pages.json            #   页面路由配置
│   ├── index.html                #   H5 入口模板
│   ├── vite.config.ts            #   Vite 构建配置
│   ├── tsconfig.json             #   TypeScript 配置
│   └── package.json              #   依赖（vue3/pinia/uni-app/vite）
│
├── mind-assessment/              # 测试套件 + 共享 JS 模块
│   ├── shared/                   #   纯 JS 测评模块（供 Jest 测试用）
│   │   ├── modules/              #     14个测评模块 + 模块系统
│   │   └── utils/                #     工具函数（评分/格式化/存储等）
│   ├── tests/                    #   测试套件
│   │   ├── frontend/             #     前端模块单元测试（10个）
│   │   └── server/               #     后端 API 集成测试（7个）
│   ├── scripts/                  #   工具脚本（题目生成等）
│   ├── jest.config.js            #   Jest 主配置
│   ├── jest.frontend.config.js   #   前端测试配置
│   ├── jest.server.config.js     #   后端测试配置
│   └── package.json              #   测试依赖（jest/express/jsonwebtoken/supertest）
│
├── server/                       # Node.js 后端服务
│   ├── config/                   #   价格表等服务端配置
│   ├── routes/                   #   API 路由（auth/pay/result）
│   ├── utils/                    #   工具（JWT/微信支付/存储适配器/校验）
│   ├── app.js                    #   Express 入口
│   ├── questions.json            #   SPM 题库数据
│   ├── .env.example              #   环境变量示例
│   └── package.json              #   后端依赖
│
├── 部署说明.md                    # H5 部署指南
└── .gitignore                    # 根级 Git 忽略规则
```

## 架构说明

| 维度 | 说明 |
|------|------|
| 前端框架 | UniApp + Vue 3 + TypeScript + Pinia |
| 构建工具 | Vite 5 |
| 支持平台 | 微信小程序、H5（浏览器） |
| 测评模块 | 14 个（TypeScript，统一模块系统） |
| 认知游戏 | 8 个 |
| 后端 | Node.js + Express（独立部署） |
| 测试 | Jest 单元测试 + API 集成测试（572 个测试） |
| 状态管理 | Pinia（stores/user.ts, stores/app.ts） |

> 前端使用 UniApp 条件编译（`#ifdef MP-WEIXIN`/`#ifdef H5`）在同一代码库中同时支持微信小程序和 H5 平台。

## 测评模块一览

| 类别 | 模块 |
|------|------|
| 智力 | SPM 瑞文推理、韦氏智力 |
| 人格 | MBTI、Big Five、16PF、EPQ、DISC |
| 情绪 | SDS、SAS、GAD-7、DASS-21 |
| 职业 | Holland 霍兰德 |
| 自我 | SES 自尊、LAS 孤独感 |

## 认知训练游戏

舒尔特方格、斯特鲁普测试、数字广度、N-Back、反应速度、图形记忆、序列推理、心理旋转

## 快速开始

### 后端服务

```bash
cd server
cp .env.example .env          # 填入微信配置
npm install && npm start
```

### 前端（H5 + 小程序）

```bash
cd mind-assessment-uniapp
npm install

# H5 开发
npm run dev:h5

# H5 生产构建
npm run build:h5

# 微信小程序开发
npm run dev:mp-weixin

# 微信小程序生产构建
npm run build:mp-weixin
# 构建产物在 dist/build/mp-weixin，用微信开发者工具导入运行
```

### 类型检查

```bash
cd mind-assessment-uniapp
npx vue-tsc --noEmit
```

### 运行测试

```bash
cd mind-assessment
npm install
npx jest --no-cache           # 全部测试（572个）
npx jest --config jest.frontend.config.js   # 仅前端模块测试
npx jest --config jest.server.config.js     # 仅后端 API 测试
```

## 免责声明

本平台所有测评结果基于参考常模估算，仅供个人探索与娱乐参考，不构成医学诊断。如需专业评估，请联系心理援助热线或心理评估专业人员。

## 许可证

MIT License
