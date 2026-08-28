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
| 方法 | `methods`（列表 / `detail` / `practice`） | 22 个心智方法知识库；部分方法提供 `schema` 驱动的「互动练习」打卡 | `ma_practices`(≤50/方法) |
| 训练 | `train`（列表 / `game` 播放器） | 31 个脑力游戏，5 大认知维度，难度分级、计时、成绩与趋势 | `ma_train_<id>`(≤50) |
| 我的 | `mine` / `profile` / `about` | 记录汇总、主题切换、用户档案、关于/隐私/数据来源 | `ma_user`、`user-theme-preference` |
| 跨域关联 | `relations.js` 被 `detail`/`result` 调用 | 依量表 `type`/特定 id 推荐相关方法与训练游戏 | — |

**关键业务流：**
- 测评闭环：`assess` 选量表 → `detail`（详解+来源+关联入口）→ `test`（自动跳题/续答/SPM 分组）→ `result`（维度/双极/分测验/趋势/存图）→ `history`（筛选/删除）。
- 训练闭环：`train` 列表（按维度分区+搜索）→ `game` 通用播放器（`usingComponents` 按 `gameId` 渲染 `games/<id>/game.js`）→ `train-store` 存成绩 → 趋势复用 `trend.js`。
- 方法闭环：`methods` 列表 → `detail`（正文/步骤/贴士/示例）→ 可发起 `practice` 互动练习 → 写入 `ma_practices`。

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

## 3. 已修复的问题（本次审查）

| # | 问题 | 位置 | 修复 |
| --- | --- | --- | --- |
| F1 | `save()` 保存即崩溃：`GENDERS` 未导入、`syncUserToCloud` 未导出 → `ReferenceError` | `pages/profile/profile.js:105,110` | 从 `user.js` 导入 `GENDERS`；改为 `saveUser(...)` 后直接 `showToast`（云同步为占位，见 I1） |
| F2 | ESLint 将 `getCurrentPages` 报为 `no-undef` error（实为微信全局 API） | `utils/theme-store.js:104,132` | `.eslintrc.js` `globals` 增加 `getCurrentPages`/`requirePlugin` |
| F3 | 死代码：`result.js` 未用的 `methodsData` 导入、`mine.js` 未用的 `saveUser` 导入、`theme-store.js` 未用的 `root` 变量 | `result.js:7` / `mine.js:3` / `theme-store.js:108` | 删除未用导入/变量 |
| F4 | 文档不一致：intro/表格称「23 套」，changelog 多处遗留「22 套/22 个模块」 | `README.md` | 全量替换为 23 |

修复后 `npm run lint` 由 **5 error / 8 warning** 降至 **0 error / 余少量 warning**（见 I4）。

---

## 4. 遗留问题与风险（Issues）

### I1 · 云同步是「假功能」（高优先级 · 误导性）
- `utils/user.js` 的 `syncUserToCloud` / `syncRecordToCloud` 直接 `return Promise.resolve()`，`wx.cloud` 调用全部注释；`saveUser`/`syncNow` 虽触发同步但**无任何实际网络行为**。
- `ma_records` 记录集合**从未被写入**：`saveRecord`（user.js:139）全仓**无任何调用方**，训练/方法/测评分别写入 `ma_train_*`/`ma_practices`/`ma_history`，与 `user.js` 的 `getRecords` 完全脱节。
- 表现：`mine`/`profile` 的「同步状态/立即同步/记录数」UI 展示的是**本地假数据**（`hasCloud = syncStatus !== 'pending'` 恒为真一旦保存过），易让用户误以为数据已上云。
- 建议：要么**明确标注为「本地优先/未接入云端」**并隐藏同步 UI，要么补全云开发初始化与云函数（字段已对齐 openid，工作量可控）。

### I2 · `theme.js` 设计系统未被实际使用（中优先级 · 过度设计）
- `utils/theme.js` 定义 `PALETTE`/`SEMANTIC`/`GRADIENTS`/`FUNCTIONAL` 及 `resolve()`/`generateCSSVariables()`，但全仓**仅 `isDark()` 被 `canvas.js` 引用**；页面样式以 `app.wxss` 的 CSS 变量为准，`resolve`/`generateCSSVariables` 是死代码。
- 建议：删除未用导出（或真正落地为 WXSS 变量生成器）；保留 `isDark` 即可，避免「设计系统」名不副实的维护负担。

### I3 · `applyTheme()` 形同虚设（低优先级）
- `theme-store.js` 的 `applyTheme`（:103）写 `current-effective-theme` 但几乎不被调用（`app.js` 走 `getEffectiveTheme + updateNativeUI`），且其内部 `root` 变量已删；`forceThemeUpdate` 仅改 `themeClass`。属冗余入口，可合并进 `useTheme`。

### I4 · 残留 lint warning（低优先级 · 工程整洁）
- `modules/hbdi/index.js:116` `total` 未使用；`tools/map-questions.js:9,20,33` `modulesByType`/`getPoleInfo`/`getDomainInfo` 未使用（dev 脚本，影响小）；`analyze.js:50` `types` 未使用。
- 建议：清理或加 `/* eslint-disable */` 注释说明为一次性脚本。

### I5 · 文档/实现细微错位
- README「改进路线图」曾称「全部高/中优先项均已完成」，但实际存在 F1/F2 等未修复项；现已在 changelog 修正并指向本文件。
- `app.json` 底部 5 Tab 含「首页/测评/方法/训练/我的」，但 `pages/index` 同时承担「首页」与详情/结果跳转枢纽，首页又有「测评/方法/训练」三大入口 pillar——导航层级略重叠，可考虑收敛首页入口以免与 Tab 重复。

---

## 5. 改进建议（按优先级）

### P0 · 数据真实性与合规
1. **处理云同步占位**（对应 I1）：在上线前二选一——(a) 隐藏 `mine`/`profile` 的同步状态/立即同步 UI，并在 `about` 明确「数据仅存本机」；(b) 接入微信云开发（`app.js` 调 `wx.cloud.init`、补 `user`/`records` 云函数，`user.js` 字段已就绪）。
2. **统一记录存储**：评估是否让 `user.saveRecord` 真正承接测评/方法/训练记录（以 `userId` 关联），或彻底移除 `ma_records` 以免误导。当前三类记录散落三处，若未来要做「跨设备/导出」需先归一。

### P1 · 架构与可维护性
3. **精简 `theme.js`**（I2）：删除死代码，或把 `PALETTE` 真正编译进 `app.wxss` CSS 变量（呼应 `generateCSSVariables` 的原始意图），让「单一事实来源」名副其实。
4. **合并主题入口**（I3）：`applyTheme` 并入 `useTheme`/`updateNativeUI`，减少概念数量。
5. **首页导航收敛**（I5）：首页 pillar 与底部 Tab 功能重叠，建议首页仅保留「最近测评 + 搜索入口 + 继续未完成」，把方法/训练导流交给对应 Tab。
6. **常量集中化**：`ma_history`/`ma_practices`/`ma_train_`/`ma_user`/`ma_records` 等存储键散落在多文件，建议在 `utils/storage-keys.js` 统一定义，避免拼写漂移。

### P2 · 体验与科学
7. **结果页增强**：数值趋势补 x 轴日期标签、类型趋势展示「首次→最近」变化（路线图第 3 项，部分已完成，可再打磨）。
8. **方法练习可视化**：`ma_practices` 目前仅列表展示，可加简单趋势（如情绪类量表的分数折线），与测评趋势体验对齐。
9. **常模溯源**：`modules-meta.js` 的 `reference`/`scoring` 已补，但部分公式仍为「近似值」，建议在详情页或 `about` 给出「本结果非医学诊断」的更强提示与文献链接。
10. **国际化/无障碍**：在 I2 之外，补充 `aria-role` 覆盖率检查（目前交互元素已较规范，可加自动化断言）。

### P3 · 工程化
11. 清理 I4 残留 warning；CI 增加「lint 非零即失败」门槛（当前仅跑冒烟+覆盖率）。
12. 补充 `user.js` 云同步分支的单元测试（mock `wx.cloud`），防止占位实现被误认为已可用。

---

## 6. 本次文档改进清单
- `README.md`：目录结构补全 5 大板块全部页面与 utils；新增「产品功能总览（五大板块）」「跨域关联」「主题与无障碍」「用户档案与云同步」四节；修正「22 套 → 23 套」；changelog 追加 code review 条目与已知问题声明。
- `docs/CODE_REVIEW.md`：（本文件）业务/架构盘点 + 问题清单 + 改进建议。
- 代码修复：F1–F4（见第 3 节）。
