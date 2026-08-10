# 心智测评中心 - 测试套件

Jest 单元测试与 API 集成测试，覆盖 14 个测评模块的评分逻辑和后端 API 接口。

> 原生微信小程序前端已迁移至 UniApp 跨平台版本（`../mind-assessment-uniapp/`），此目录仅保留测试套件和共享 JS 模块。

## 目录结构

```
mind-assessment/
├── shared/                   # 纯 JS 测评模块（供 Jest 测试用）
│   ├── modules/              #   14个测评模块 + 模块系统
│   └── utils/                #   工具函数（评分/格式化/存储等）
├── tests/                    # 测试套件
│   ├── frontend/             #   前端模块单元测试（10个）
│   │   ├── big5-scoring.test.js
│   │   ├── format.test.js
│   │   ├── mbti-scoring.test.js
│   │   ├── module-interface.test.js
│   │   ├── module-system.test.js
│   │   ├── pf16-scoring.test.js
│   │   ├── scale-scoring.test.js
│   │   ├── sds-scoring.test.js
│   │   ├── spm-scoring.test.js
│   │   └── wechsler-scoring.test.js
│   └── server/               #   后端 API 集成测试（7个）
│       ├── auth.test.js
│       ├── health.test.js
│       ├── login.test.js
│       ├── pay.test.js
│       ├── result.test.js
│       ├── store.test.js
│       └── validate.test.js
├── scripts/                  # 工具脚本（题目生成等）
├── jest.config.js            # Jest 主配置
├── jest.frontend.config.js   # 前端测试配置
├── jest.server.config.js     # 后端测试配置
└── package.json              # 测试依赖
```

## 运行测试

```bash
npm install

# 全部测试（572个）
npx jest --no-cache

# 仅前端模块测试
npx jest --config jest.frontend.config.js

# 仅后端 API 测试
npx jest --config jest.server.config.js
```

> Windows 环境建议加 `--no-cache` 避免缓存权限问题。

## 测试覆盖

| 类别 | 测试文件 | 说明 |
|------|---------|------|
| 模块评分 | big5-scoring.test.js | Big Five 五维评分 + 反向计分 |
| 模块评分 | mbti-scoring.test.js | MBTI 四维度 + 16型分类 |
| 模块评分 | pf16-scoring.test.js | 16PF 因素评分 + 次元特征 |
| 模块评分 | sds-scoring.test.js | SDS 抑郁指数 + 严重度分级 |
| 模块评分 | spm-scoring.test.js | SPM IQ估算 + 百分位 |
| 模块评分 | wechsler-scoring.test.js | 韦氏 FSIQ/VIQ/PIQ + 分测验 |
| 工具函数 | scale-scoring.test.js | 通用量表评分工具 |
| 工具函数 | format.test.js | 分数/等级格式化 |
| 模块系统 | module-system.test.js | 注册表查询/分组/卡片信息 |
| 模块系统 | module-interface.test.js | 14个模块接口合规性校验 |
| 后端API | auth.test.js | JWT 签发与认证中间件 |
| 后端API | health.test.js | 健康检查 + 404 + 鉴权 |
| 后端API | login.test.js | 微信登录 code2session |
| 后端API | pay.test.js | 支付下单/确认/回调/幂等 |
| 后端API | result.test.js | 结果保存/查询/付费检查 |
| 后端API | store.test.js | 存储适配器 |
| 后端API | validate.test.js | 输入校验工具 |

## 许可证

MIT License
