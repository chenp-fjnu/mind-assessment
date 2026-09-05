# 心智探索局 · 小程序代码审查与改进建议

> 本文档在「全面梳理代码与业务功能」基础上，记录架构盘点、已修复问题、遗留问题与按优先级排列的改进建议。
> 配套：根目录 `README.md`（产品/运行/架构说明）、`docs/brain-games-catalog.md`（训练游戏候选清单）。
> 审查基准：`wechat-miniprogram/` 当前工作区（23 量表 / 31 游戏 / 11 页面 / 约 30 个 utils）。

---

## 1. 业务功能梳理

小程序定位为**纯前端、离线、无后端**的心理学自我探索工具，围绕「**测评 · 方法 · 训练**」形成闭环：

| 板块 | 页面 | 业务功能 | 数据落点（Storage） |
| --- | --- | --- | --- |
| 测评 | `index` / `assess` / `detail` / `test` / `result` / `history` | 23 套量表（9 大类：人格/情绪/智力/职业/自我/压力/睡眠/社交/积极心理），答题→评分→可视化→同量表历史趋势 | `ma_history`(≤30)、`ma_progress_<id>` |
| 方法 | `methods`（列表 / `detail` / `practice`） | 22 个心智方法知识库；部分方法提供 `schema` 驱动的「互动练习」打卡，**新增练习趋势图表可视化** | `ma_practices`(≤50/方法) |
| 训练 | `train`（列表 / `game` 播放器） | 31 个脑力游戏，5 大认知维度，难度分级、计时、成绩与趋势 | `ma_train_<id>`(≤50) |
| 我的 | `mine` / `profile` / `about` | 记录汇总、主题切换、用户档案、关于/隐私/数据来源 | `ma_user`、`user-theme-preference` |
| 跨域关联 | `relations.js` 被 `detail`/`result` 调用 | 依量表 `type`/特定 id 推荐相关方法与训练游戏 | — |

**关键业务流：**
- 测评闭环：`assess` 选量表 → `detail`（详解+来源+关联入口）→ `test`（自动跳题/续答/SPM 分组）→ `result`（维度/双极/分测验/趋势/存图）→ `history`（筛选/删除）。
- 训练闭环：`train` 列表（按维度分区+搜索）→ `game` 通用播放器（`usingComponents` 按 `gameId` 渲染 `games/<id>/game.js`）→ `train-store` 存成绩 → 趋势复用 `trend.js`。
- 方法闭环：`methods` 列表 → `detail`（正文/步骤/贴士/示例）→ 可发起 `practice` 互动练习 → 写入 `ma_practices`，**练习趋势图表化展示**。

**数据模型要点：**
- 模块契约（约定大于配置）：每个 `modules/<id>/index.js` 暴露 `{ id, type, name, ..., getQuestions, computeResult, getResultView }`，`getResultView(r, layout)` 返回标准化 `{ groups, dims, subtests, interpretations, showBipolar }`，页面只渲染、零鸭子类型分支。
- 游戏契约：`games/<id>/index.js`（纯逻辑：元数据/`generate`/`score`）+ `game.js`（`Component` 交互渲染），由 `game-registry.js` 字面量 require 注册保证打包。
- 注册表双写：`registry.js` / `game-registry.js` 用「loader 函数包裹字面量 require」既延迟加载又确保微信打包器静态分析。

---

## 2. 代码架构盘点（亮点）

- **统一结果视图契约**：`getResultView` 收敛全部 23 模块，消除 `result.js` 的鸭子类型分支，smoke/Jest 共用，可维护性强。
- **注册表 + 字面量 require**：规避动态 require 导致的「模块未打包」运行时报错，是微信小程序分包/主包场景的最佳实践。
- **`utils/` 单一职责清晰**：`color`（唯一颜色工具）、`scale-scoring`、`scoring`、`trend`、`result-view`、`figure`（含色盲纹理）等纯函数可单测。
- **测试体系较完整**：`test/smoke.js`（158 项评分链路）+ Jest（`modules.test`/`utils.test`/`pages.test`）+ `npm run test:all` + `jest.config` 覆盖率门槛 + GitHub Actions CI。
- **主题系统**：`theme-store.js` 的 `useTheme(page)` 注入 `themeClass` 并同步原生 `tabBar`/`navigationBar`，`onThemeChange` 实时响应系统切换。
- **工程化**：ESLint + Prettier + `format`/`lint` 脚本、`.editorconfig`、隐私合规 `privacy.js`。

---

## 3. 已修复的问题（本次审查 + 最新优化）

| # | 问题 | 位置 | 修复 |
| --- | --- | --- | --- |
| F1 | `save()` 保存即崩溃：`GENDERS` 未导入、`syncUserToCloud` 未导出 → `ReferenceError` | `pages/profile/profile.js:105,110` | 从 `user.js` 导入 `GENDERS`；改为 `saveUser(...)` 后直接 `showToast`（云同步为占位，见 I1） |
| F2 | ESLint 将 `getCurrentPages` 报为 `no-undef` error（实为微信全局 API） | `utils/theme-store.js:104,132` | `.eslintrc.js` `globals` 增加 `getCurrentPages`/`requirePlugin` |
| F3 | 死代码：`result.js` 未用的 `methodsData` 导入、`mine.js` 未用的 `saveUser` 导入、`theme-store.js` 未用的 `root` 变量 | `result.js:7` / `mine.js:3` / `theme-store.js:108` | 删除未用导入/变量 |
| F4 | 文档不一致：intro/表格称「23 套」，changelog 多处遗留「22 套/22 个模块」 | `README.md` | 全量替换为 23 |
| **F5** | **云同步假功能误导用户** | `pages/mine/mine.wxml`, `pages/profile/profile.wxml`, `pages/about/about.wxml` | **移除同步状态/立即同步 UI，about 页明确标注「当前版本为纯本地存储，未接入云同步」** |
| **F6** | **theme.js 过度设计（死代码）** | `utils/theme.js` | **精简仅保留 `isDark()`，删除 PALETTE/SEMANTIC/GRADIENTS/FUNCTIONAL/resolve/generateCSSVariables** |
| **F7** | **applyTheme 冗余** | `utils/theme-store.js` | **已删除 applyTheme，逻辑合并入 useTheme/updateNativeUI** |
| **F8** | **Lint warnings 清理** | `modules/hbdi/index.js`, `games/breath-478/game.js`, `games/hanoi/game.js`, `games/mindfulness/game.js`, `games/resonance/game.js`, `pages/profile/profile.js` | **移除未用变量，`npm run lint` 现 0 error 0 warning** |
| **F9** | **趋势图日期显示优化** | `utils/canvas.js` | **>8/10 条时按间隔显示日期，保留首尾，避免重叠** |
| **F10** | **方法练习趋势可视化** | `pages/methods/detail.js`, `pages/methods/practice.js`, `pages/methods/detail.wxml`, `pages/methods/practice.wxml` | **新增 canvas 折线图，复用 renderTrend，显示首次→最近变化** |
| **F11** | **严格 Lint + CI 门槛** | `package.json`, `.github/workflows/ci.yml` | **新增 `lint:strict`（max-warnings 0），CI 强制通过** |

修复后 `npm run lint` 与 `npm run lint:strict` 均 **0 error / 0 warning**。

---

## 4. 遗留问题与风险（Issues）

### I1 · 云同步是「假功能」（高优先级 · 误导性）⚠️ **已缓解：UI 隐藏 + 明确标注**
- `utils/user.js` 的 `syncUserToCloud` / `syncRecordToCloud` 直接 `return Promise.resolve()`，`wx.cloud` 调用全部注释；`saveUser`/`syncNow` 虽触发同步但**无任何实际网络行为**。
- `ma_records` 记录集合**从未被写入**：`saveRecord`（user.js:139）全仓**无任何调用方**，训练/方法/测评分别写入 `ma_train_*`/`ma_practices`/`ma_history`，与 `user.js` 的 `getRecords` 完全脱节。
- **现状**：已在 `mine`/`profile`/`about` 移除同步 UI，并在 about 页明确标注「当前版本为纯本地存储，未接入云同步，数据仅存在本机，更换设备/清理缓存/卸载将丢失」。如需上线云同步，需补全 `wx.cloud.init` 与云函数。

### I2 · `theme.js` 设计系统未被实际使用（中优先级 · 过度设计）✅ **已完成：精简仅保留 isDark**

### I3 · `applyTheme()` 形同虚设（低优先级）✅ **已完成：已删除**

### I4 · 残留 lint warning（低优先级 · 工程整洁）✅ **已完成：全部清理**

### I5 · 文档/实现细微错位 ✅ **已完成：首页导航收敛、文档同步**

---

## 5. 改进建议（按优先级）

### P0 · 数据真实性与合规
1. **处理云同步占位**（对应 I1）：当前方案为「隐藏 UI + 明确标注本地优先」；如需真正云同步，接入微信云开发（`app.js` 调 `wx.cloud.init`、补 `user`/`records` 云函数，`user.js` 字段已就绪）。

### P1 · 架构与可维护性
2. **常量集中化**：`ma_history`/`ma_practices`/`ma_train_`/`ma_user`/`ma_records` 等存储键散落在多文件，建议在 `utils/storage-keys.js` 统一定义（当前已大部分集中，仅 `ma_records` 相关已移除）。

### P2 · 体验与科学
3. **结果页趋势增强**：数值趋势已补间隔日期显示，后续可考虑横向滚动容器或交互式缩放。
4. **常模溯源**：`modules-meta.js` 的 `reference`/`scoring` 已补，建议在详情页/关于页给出更醒目免责声明与文献链接。

### P3 · 工程化
5. 补充 `user.js` 云同步分支的单元测试（mock `wx.cloud`），防止占位实现被误认为已可用。
6. 考虑逐步引入 TypeScript（从 `utils/registry`、`utils/game-registry` 等核心模块开始）。

---

## 6. 本次文档改进清单
- `README.md`：目录结构补全 5 大板块全部页面与 utils；新增「产品功能总览（五大板块）」「跨域关联」「主题与无障碍」「用户档案与云同步」四节；修正「22 套 → 23 套」；changelog 追加 code review 条目与已知问题声明。
- `docs/CODE_REVIEW.md`：（本文件）业务/架构盘点 + 问题清单 + 改进建议，**新增「已修复问题」F5–F11，「遗留问题」I1–I5 状态更新**。
- 代码修复：F1–F11（见第 3 节）。
