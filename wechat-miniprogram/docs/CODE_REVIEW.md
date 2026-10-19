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
| **F12** | **反向计分公式双实现**（`scoring.scoreItem` 与 `scale-scoring.computeScaleScores` 各写一遍 `min+max-raw`） | 新增 `utils/reverse.js`（单一来源）；两处 `require` 复用 | **抽取 `reverseValue(raw,min,max)` 纯函数为唯一公式实现，`scoreItem`/`computeScaleScores` 共用；各自的答案编码/索引换算/null 处理保持原样（属各自职责，非重复）。新增 `reverse` 单测，覆盖率 100%** |
| **F13** | **答题进度丢失边界**：`test.js` `saveProgress` 2 秒节流，但 `onUnload` 仅清定时器不兜底落盘，2 秒内连续答题后退出丢进度 | `pages/test/test.js` | **新增 `saveProgressForce()`（绕过节流强制落盘）+ `onUnload`/`onHide` 兜底调用；用 `_finished` 标志位区分「已交卷」（`doSubmit` 已清进度，不再写回）与「中途退出」，避免把刚清掉的进度重新写回** |
| **F14** | **4 个游戏定时器泄漏**：`memory-match`/`mirror`/`number-maze`/`visual-search` 有 pending `setTimeout` 却无清理钩子，组件卸载后回调仍 `setData`/`triggerEvent` | 上述 4 个 `game.js` | **补 `lifetimes.detached` + 各 `clearTimers/clearPending`，`reset()` 先清旧定时器，新建前先 `clearTimeout`（对齐 `box-breathing` 范例）。已扫描全部 34 游戏：21 个含定时器的均已具备清理钩子** |
| **F15** | **死代码**：`storage-keys.js` 的 `progressKey()`/`trainKey()` 全仓无调用方 | `utils/storage-keys.js` | **删除两个未用助手（页面直接用 `PROGRESS_PREFIX`/`TRAIN_PREFIX` 字符串拼接）** |
| **F16** | **`SCHEMA_VERSION` 双写**：`test.js` 与 `result.js` 各定义 `=1`，易漂移 | 新增 `utils/constants.js`；两页面 `require` | **抽到 `utils/constants.js` 单一来源，`test.js`/`result.js` 统一引用** |
| **F17** | **云同步占位死代码**（对应 I1，本地功能保留）：`user.js` 的 `CLOUD_ENABLED`/`isCloudEnabled`/`initCloud`/`syncNow`/`getSyncStatus`/`syncUserToCloud` 及 `openid/unionid/syncStatus/lastSync` 字段全仓无调用方 | `utils/user.js`, `test/user.test.js` | **删除云占位函数与预留字段，保留全部本地功能（`ensureUser`/`getUser`/`getUserId`/`saveUser`/`GENDERS` 等）。与 F5/I1「纯本地、不接云」决策一致。测试同步改为断言「无云占位字段」** |
| **F18** | **主包体积冗余**：`wechat-miniprogram/project.config.json`（`app.json` 同目录、生效配置）的 `packOptions.ignore` 已排除 `node_modules/coverage/test/tools/docs/scripts/.github`，但根目录一批**纯开发文件**仍被打包进主包（`package-lock.json` 159K、`README.md` 37K、`package.json`、`jest.config.js`、`analyze.js`、`.eslintrc.js`、`.prettierrc.json`、`.editorconfig`、`.gitattributes`），合计约 200K 无运行时价值 | `wechat-miniprogram/project.config.json` | **补 `packOptions.ignore`：按 `file` 排除上述 8 个开发文件 + 按 `suffix:md` 排除所有 markdown。排除后实测算力包内容 ≈ **1.93 MiB**（assets 224K + games 546K + utils 460K + modules 316K + pages 345K + 运行时根文件 ≈34K），远低于 2M 主包上限，**无需分包**。注：早期误判「ignore 为空、coverage 4.8M 会被打包」系读错文件——生效的是 `wechat-miniprogram/` 内的 `project.config.json`（appid `wx215011be68b87714`），非仓库根目录那份（appid `wxcb1a57da3ff2a353`，已过期）；`.wav` 源文件在已被忽略的 `tools/` 内，音频实为 84K 而非 988K** |
| **F19** | **结果页 `onLoad` 过重 + 分享卡片重复绘制**：`onLoad`（200+ 行）的 `setData` 回调里 `drawCardToTemp`，与 `onReady` 里的 `drawCardToTemp` **各绘一遍**，`renderCard` 空跑两次；趋势图仅绘于 `setData` 回调 | `pages/result/result.js` | **画布渲染统一收拢到 `onReady`（节点布局完成、画布就绪后一次绘制：趋势图 + 分享卡片），移除 `setData` 回调；`_shareImage` 仅在 `onShareAppMessage` 时被消费，`onReady` 必然先于分享触发，行为不变。另把自洽的时间计算块（`testedTime`/`retestGap`/`retakeHint`）抽为纯方法 `_computeTestTimes(allHist,id)`，`onLoad` 由 196 行减至 ~150 行。纯函数抽离后便于补单测** |

修复后 `npm run lint` 与 `npm run lint:strict` 均 **0 error / 0 warning**，`node test/smoke.js`（170）+ Jest（266）+ 覆盖率门槛全绿。

---

## 4. 遗留问题与风险（Issues）

### I1 · 云同步是「假功能」（高优先级 · 误导性）✅ **已解决：占位死代码删除（F17）+ UI 隐藏（F5）**
- ~~`utils/user.js` 的 `syncUserToCloud` / `syncRecordToCloud` 直接 `return Promise.resolve()`~~ **已删除全部云占位函数与 `openid/unionid/syncStatus/lastSync` 字段（F17）**。
- `user.js` 现为**纯本地实现**，文件头注释已注明「当前版本纯本地离线；如需云同步接入微信云开发时按需补回」。
- **现状**：代码与「纯本地」决策一致，无误导性同步 UI。上线云同步需新建 `wx.cloud.init` 与云函数，并在 `user.js` 重新引入同步逻辑（非破坏性，本地字段已兼容）。

### I2 · `theme.js` 设计系统未被实际使用（中优先级 · 过度设计）✅ **已完成：精简仅保留 isDark**

### I3 · `applyTheme()` 形同虚设（低优先级）✅ **已完成：已删除**

### I4 · 残留 lint warning（低优先级 · 工程整洁）✅ **已完成：全部清理**

### I5 · 文档/实现细微错位 ✅ **已完成：首页导航收敛、文档同步**

---

## 5. 改进建议（按优先级）

### P0 · 数据真实性与合规
1. **处理云同步占位**（对应 I1）：✅ **已完成（F17）** —— 删除全部云占位死代码，代码与「纯本地」决策一致。如需真正云同步，接入微信云开发（`app.js` 调 `wx.cloud.init`、补 `user`/`records` 云函数，本地字段已兼容）。

### P1 · 架构与可维护性
2. **常量集中化**：✅ **已完成** —— `SCHEMA_VERSION` 抽到 `utils/constants.js`（F16）；存储键集中于 `utils/storage-keys.js`，未用的 `progressKey`/`trainKey` 已删（F15）。
3. **计分逻辑收敛**：✅ **已完成（F12）** —— 反向计分公式收敛到 `utils/reverse.js` 单一来源，消除双实现漂移风险。
4. **答题进度健壮性**：✅ **已完成（F13）** —— `onUnload`/`onHide` 兜底落盘，杜绝节流窗口内退出丢进度。
5. **游戏生命周期清理**：✅ **已完成（F14）** —— 全部含定时器的游戏补 `detached` 清理钩子。
6. **主包体积**：✅ **已完成（F18）** —— `packOptions.ignore` 补全开发文件排除；实测打包内容 ≈1.93 MiB，低于 2M 上限，无需分包。若后续音频/素材继续膨胀逼近上限，再考虑 `subpackages`（把 `games/`、`modules/` 拆到子包）或素材远程化。
7. **结果页可维护性**：✅ **已完成（F19）** —— `onLoad` 拆分（时间计算抽为 `_computeTestTimes`）、分享卡片重复绘制消除（画布渲染统一收拢 `onReady`）。

### P2 · 体验与科学
6. **结果页趋势增强**：数值趋势已补间隔日期显示，后续可考虑横向滚动容器或交互式缩放。
7. **常模溯源**：`modules-meta.js` 的 `reference`/`scoring` 已补，建议在详情页/关于页给出更醒目免责声明与文献链接。

### P3 · 工程化
8. 若未来接入云同步，补 `wx.cloud` 分支的单元测试（当前 `user.js` 已为纯本地实现，无云分支）。
9. 考虑逐步引入 TypeScript（从 `utils/registry`、`utils/game-registry` 等核心模块开始）。

---

## 6. 本次文档改进清单
- `README.md`：目录结构补全 5 大板块全部页面与 utils；新增「产品功能总览（五大板块）」「跨域关联」「主题与无障碍」「用户档案与云同步」四节；修正「22 套 → 23 套」；changelog 追加 code review 条目与已知问题声明。
- `docs/CODE_REVIEW.md`：（本文件）业务/架构盘点 + 问题清单 + 改进建议，**「已修复问题」F5–F17、「遗留问题」I1–I5 状态更新**。
- 代码修复：F1–F17（见第 3 节）。
