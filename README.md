---
项目: mind-assessment
名称: 心智探索局（Mind Quest）
类型: 微信小程序（原生）
状态: 已交付 · 维护中
技术栈: 原生小程序（纯前端 / 无后端 / 无网络请求）
开始: 2026-08-10
最后更新: 2026-11-18
---

# 心智探索局（Mind Quest）

> 纯前端**原生微信小程序**：**27 套心理量表 + 24 个心智方法 + 36 个脑力训练游戏**，围绕「测评 → 方法 → 训练 → 记录」形成自我探索闭环。所有题目、计分与结果均在设备本地完成，数据只写入本机 `Storage`。

> **仓库说明**：早期版本的 UniApp/H5 前端（`mind-assessment-uniapp/`）、Node 服务（`server/`）与独立测试套件（`mind-assessment/`）已从仓库移除。当前唯一可运行工程是 [`wechat-miniprogram/`](wechat-miniprogram/)，根目录文档不再描述已不存在的目录或部署流程。

---

## 现状一览

| 维度 | 现状 |
| --- | --- |
| 量表 | **27 套**，覆盖 9 大类（人格 8 / 职业 3 / 情绪 5 / 自我 4 / 智力 3 / 压力 1 / 睡眠 1 / 社交 1 / 积极心理 1） |
| 方法 | **24 个**心智方法，4 个分类，全部支持结构化「互动练习」打卡 |
| 训练 | **36 个**脑力游戏，6 大认知维度（注意力 9 / 工作记忆 8 / 反应速度 9 / 放松正念 4 / 执行功能 5 / 逻辑计算 1） |
| 页面 | **14 个**（5 个底部 Tab + 详情/答题/结果/历史/关于/档案/方法详情/方法练习/训练播放器） |
| 数据 | 纯本地 `Storage`，无后端、无网络请求、无云同步 |
| 测试 | 冒烟 **182** 项 + Jest **284** 项（13 个测试套件）；覆盖率约 **70% 语句 / 46% 分支 / 74% 函数 / 72% 行** |
| 质量门 | `validate`（元数据/玩家页一致性）+ `lint:strict`（0 warning）+ `test:all`，CI 全绿 |

---

## 目录结构

```text
mind-assessment/
├── wechat-miniprogram/          # 唯一运行工程：原生微信小程序
│   ├── app.js / app.json / app.wxss
│   ├── modules/                 # 27 个量表模块（每个 index.js 自包含）
│   ├── games/                   # 36 个训练游戏（index.js 纯逻辑 + game.js 组件）
│   ├── pages/                   # 14 个页面（首页/测评/方法/训练/我的 + 详情/答题/结果/历史等）
│   ├── utils/                   # 注册表、存储、评分、趋势、主题、绘图等纯函数与工具
│   ├── test/                    # 冒烟 + Jest 单测/页面测试
│   ├── scripts/ tools/          # 一致性校验与代码生成脚本
│   └── docs/                    # 架构、审查、游戏清单
├── project.config.json          # 历史遗留配置（未声明 miniprogramRoot，无实际作用）
└── README.md
```

> ⚠️ 请在微信开发者工具中直接「导入项目」→ 选择 **`wechat-miniprogram/`** 子目录。根目录的 `project.config.json` 是早期工程留下的占位配置，与子工程 AppID 不一致，导入根目录会因缺少 `app.json` 而无法编译。

---

## 业务闭环

```text
测评：assess / index → detail（说明+来源+关联）→ test（答题/续答/计时）
      → result（维度/双极/分测验/趋势/存图）→ history（筛选/删除/导出）

方法：methods（24 个方法）→ detail（正文/步骤/贴士/示例）
      → practice（按 schema 填表打卡）→ ma_practices → 练习趋势

训练：train（6 维度/搜索/筛选）→ train/game（难度/计时/成绩）
      → ma_train_<id>__<level> → 最佳成绩 + 趋势 + 最近训练
```

跨域关联由 `utils/relations.js` 统一计算：量表按类型或显式 id 推荐相关方法与训练游戏，供详情页和结果页复用，避免各页重复映射。

---

## 快速开始

### 运行小程序

1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 「导入项目」→ 目录选择 **`wechat-miniprogram/`**（不是仓库根目录）。
3. 使用测试号，或把 `wechat-miniprogram/project.config.json` 中的 AppID 换成自己的。
4. 基础库建议 **3.0.0+**（工程已开启 `lazyCodeLoading: requiredComponents`）。

### 开发与质量命令

```bash
cd wechat-miniprogram
npm install

npm test                 # 冒烟：评分链路 + 模块/结果视图契约（182 项）
npm run validate         # 元数据 + 玩家页组件挂载一致性校验
npm run test:simulate    # Jest 单测 / 页面测试（284 项）
npm run test:coverage    # Jest + 覆盖率
npm run test:all         # validate + 冒烟 + Jest 覆盖率（CI 同款）
npm run lint:strict      # ESLint，0 error / 0 warning
```

---

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`wechat-miniprogram/README.md`](wechat-miniprogram/README.md) | 功能清单、量表/游戏明细、目录、测试与更新日志 |
| [`wechat-miniprogram/docs/ARCHITECTURE.md`](wechat-miniprogram/docs/ARCHITECTURE.md) | 分层架构、业务流、数据模型、模块契约、扩展指南 |
| [`wechat-miniprogram/docs/CODE_REVIEW.md`](wechat-miniprogram/docs/CODE_REVIEW.md) | 2026-11-18 代码审查：问题清单、优先级与改进路线图 |
| [`wechat-miniprogram/docs/brain-games-catalog.md`](wechat-miniprogram/docs/brain-games-catalog.md) | 训练游戏的范式来源与选型依据 |

---

## 设计约束

- **离线优先**：不依赖登录、后端或云函数；卸载/清缓存会丢失本地记录，关于页已明确提示。
- **本地数据版本化**：测评记录带 `schemaVersion`；量表题量变化时结果页按题量匹配兜底。
- **可测试性**：量表评分、游戏生成/计分、趋势、结果视图均为纯函数；页面通过最小 `wx` mock 运行 `onLoad`。
- **无障碍**：交互元素带 `role`/`aria-label`，图形题提供序号/字母徽标与色盲纹理冗余通道。
- **生成文件不可手改**：`pages/train/game.json`、`pages/train/games-block.wxml`、`utils/modules-meta.js` 由脚本生成，CI 有校验闸门。

---

## 免责声明

本平台所有量表均为**简化 / 教育版**自陈问卷，计分与常模为公开资料整理的近似值；训练游戏仅作认知热身与自我探索。所有结果**不构成医学诊断或专业建议**。如有持续情绪困扰或疑似认知问题，请咨询心理/精神科专业人员。

## 许可证

教育 / 演示用途。量表名称与版权归原作者与出版方所有；本实现仅作技术演示，MIT License。
