# 心智探索局 · 代码审查与改进建议

> **审查日期**：2026-11-18
> **审查基线**：`wechat-miniprogram/` 当前工作区 —— 27 套量表 / 24 个方法 / 36 个游戏 / 14 个页面
> **验证状态**：`npm run validate` 通过；`node test/smoke.js` 182/182；Jest 13 suites / 284 tests；`lint:strict` 0 error / 0 warning；覆盖率约 70% 语句 / 46% 分支 / 74% 函数 / 72% 行
> **配套文档**：[`ARCHITECTURE.md`](ARCHITECTURE.md)（架构与业务流）、[`../README.md`](../README.md)（功能清单）、[`brain-games-catalog.md`](brain-games-catalog.md)（游戏范式）

> 说明：本文第 4 节保留 F1–F19 历史修复档案；第 3 节是 2026-11-18 复审新增的问题，按严重度排序。文档中早期条目里的「23 套 / 31 游戏」等数字是当时快照，不代表当前状态。

---

## 1. 业务与架构速览

| 板块 | 页面 | 核心能力 | 数据落点 |
| --- | --- | --- | --- |
| 测评 | `index` / `assess` / `detail` / `test` / `result` / `history` | 27 套量表（9 类）→ 答题 → 评分 → 视图 → 趋势 → 存图 | `ma_history`(≤30)、`ma_progress_<id>` |
| 方法 | `methods` / `methods/detail` / `methods/practice` | 24 个方法（4 类），schema 驱动互动练习 + 趋势 | `ma_practices`(≤50/方法) |
| 训练 | `train` / `train/game` | 36 个游戏（6 维度），难度隔离、最佳、趋势、年龄常模 | `ma_train_<id>__<level>`(≤50)、`ma_train_last` |
| 我的 | `mine` / `profile` / `about` | 记录汇总、主题、档案、隐私与来源 | `ma_user`、主题键 |
| 跨域 | `relations.js` | 量表 → 相关方法/训练推荐 | — |

**架构亮点**

- 注册表用「loader + 字面量 require」兼顾懒加载与微信静态打包。
- 结果视图统一为 `{ groups, dims, subtests, interpretations, showBipolar }`，页面零鸭子类型分支。
- 量表评分、游戏生成/计分、趋势、结果视图均为纯函数；Jest 可在 Node 中直接跑。
- 生成文件（玩家页挂载、元数据）有 `validate` 闸门，避免手改漂移。
- 生命周期清理、隐私封装、无障碍标签、色盲纹理等横切能力已成体系。

---

## 2. 本次审查方法

1. 阅读全部页面、`utils/`、模块/游戏注册表与代表性模块/游戏实现。
2. 运行 `validate`、冒烟、Jest、`lint:strict`、覆盖率，确认基线全绿。
3. 用 Node 最小 mock 复现关键数据问题（训练记录时间、主题 AUTO、历史最佳方向）。
4. 对照 README/CODE_REVIEW/brain-games-catalog 与代码实际计数、字段、流程，标出文档漂移。

---

## 3. 新发现问题（2026-11-18）

| # | 严重度 | 问题 | 位置 | 影响 |
| --- | --- | --- | --- | --- |
| N1 | **P0** | 训练成绩的「游戏耗时」覆盖了「记录时间戳」 | `utils/train-store.js:22-25`、`pages/train/game.js:129-139` | 训练历史显示 1970 年、趋势日期错误、最近训练排序错误 |
| N2 | **P1** | 测评历史配额兜底对 `const` 变量重新赋值 | `pages/test/test.js:768-779` | 存储超限时抛 `TypeError`，兜底失效、记录丢失 |
| N3 | **P1** | 进行中测评的「上次编辑」用了题号当时间戳 | `pages/history/history.js:83-85`、`history.wxml:57` | 显示 1970-01-01；进行中列表按题号而非时间排序 |
| N4 | **P1** | 从历史打开旧记录时，结果页时间/GAP 取的是最新记录 | `pages/history/history.js:170`、`pages/result/result.js:252-266` | 「测评时间 / 距上次测评」与所选记录不符 |
| N5 | **P1** | 主题「跟随系统」实际始终为浅色 | `utils/theme-store.js:69-87`、`app.json` | AUTO 模式失效；需手动切深色 |
| N6 | **P2** | 训练播放页首屏最佳成绩恒为「暂无记录」 | `pages/train/game.js:73` | 进页时 Hero 与难度芯片信息不一致（芯片正确、Hero 错误） |
| N7 | **P2** | 详情页「历史最佳」一律取最大值 | `pages/detail/detail.js:69-70` | 焦虑/抑郁等越低越好的量表，把最差成绩标成「最佳」 |
| N8 | **P2** | 交卷时 `computeResult` 无异常保护 | `pages/test/test.js:746-749` | 评分异常会崩溃且进度已删；结果页的兜底来不及生效 |
| N9 | **P2** | 文档/注释计数与实现漂移 | 根 README、`wechat-miniprogram/README.md`、`about.js`、`tools/gen-game-player.js` | README 已在本轮修正；`about.js` 来源列表、生成器注释仍为手工维护 |
| N10 | **P3** | 详情/方法页保存图片未走隐私封装 | `pages/detail/detail.js:125`、`pages/methods/detail.js:142` | 与结果页 `withPrivacy` 行为不一致，新基础库下可能被拦截 |
| N11 | **P3** | 关键缺陷缺少回归测试 | `test/` | N1/N2/N3/N4/N5 在当前 284 项测试下仍全绿 |
| N12 | **P3** | 根目录遗留 `project.config.json` 与子工程不一致 | 仓库根 `project.config.json` | 无 `miniprogramRoot`、AppID 与 `wechat-miniprogram/project.config.json` 不同；导入根目录无法编译 |

### N1 · 训练记录时间戳被游戏耗时覆盖（P0）

**证据**

- `train-store.save()`：
  ```js
  const rec = Object.assign(
    { rid, level, time: Date.now(), summary: String(metricValue), userId },
    detail || {}
  )
  ```
- `pages/train/game.js` 的 `onFinish` 传入 `detail.time = r.time`，而 `r.time` 是**单局耗时（秒）**。

**实测**

```text
record.time = 12.5  → fmt(record.time) = 1970-01-01 08:00
```

**影响**

- `history.js` 训练记录 `timeText: fmt(r.time)` → 1970 年；
- `trainStore.allRecords()` 按 `time` 排序 → 实际按「单局耗时」排序；
- `trainStore.trend()` 把 `r.time` 当日期传给 `computeTrend` → 趋势图横轴错误；
- 首页 `lastTimes()` 用同一字段 → 「最近训练」排序错误。

**建议**

1. 记录级 `time` 永远由 `save()` 写入 `Date.now()`，禁止 `detail` 覆盖；
2. 把游戏耗时改名为 `elapsed`（或 `duration`），在 `onFinish` 中传 `elapsed: r.time`；
3. 旧数据兼容：读取时若 `time < 1e12`（明显是秒级耗时），按 `rid` 中的时间或当前时间兜底，并标记 `timeReliable=false`；
4. 增加回归测试：保存带 `time` 的 detail 后，断言 `record.time` 为毫秒时间戳、`fmt` 不是 1970、趋势日期正确。

### N2 · 配额兜底对 const 重新赋值（P1）

**证据**：`pages/test/test.js:768-779`

```js
const trimmed = hist.slice(0, HISTORY_LIMIT)
...
for (let guard = 0; guard < trimmed.length; guard++) {
  try {
    wx.setStorageSync(SK.HISTORY, trimmed)
    break
  } catch (e) {
    trimmed = trimmed.slice(0, trimmed.length - 1)  // TypeError
  }
}
```

**影响**：仅在 `Storage` 超限时触发；一旦触发，异常向上冒泡，交卷流程中断，用户刚完成的测评无法保存（进度已在前面删除）。

**建议**：改为 `let trimmed`；同时把「删除进度」移到保存成功之后，失败时保留进度并提示「存储空间不足，请清理后重试」。

### N3 · 进行中测评的「上次编辑」时间错误（P1）

**证据**

- `test.js:679-683` 进度结构只有 `{ answers, current, startedAt }`，没有 `updatedAt`；
- `history.js:83-85`：
  ```js
  updated: prog.current || 0,
  updatedText: fmt(prog.current || 0)
  ```
- `history.wxml:57` 直接展示「上次编辑：{{p.updatedText}}」。

**影响**：`fmt(3)` → `1970-01-01 08:00`；`out.sort((a,b) => b.updated - a.updated)` 按答题位置排序，不是按最近编辑。

**建议**：进度写入时加 `updatedAt: Date.now()`；历史页用 `prog.updatedAt` 排序与展示，缺失时显示「进行中」而非 1970 时间。可同时展示「已答 X/Y」。

### N4 · 归档记录的时间/GAP 取错（P1）

**证据**

- `history.open()` 只传 `{ id, answers }`，没有 `time`；
- `result.js:252`：
  ```js
  const selfTimeSrc = (app.globalData.lastResult && app.globalData.lastResult.time)
    || (myHist[0] && myHist[0].time) || Date.now()
  ```
- `_computeTestTimes` 的 `testedTime` 也固定用 `myHist[0]`（最新一条）。

**影响**：从历史打开旧记录时，页面显示的时间、重测间隔、重测提示都按最新记录计算，容易误导用户。

**建议**：`history.open()` 传 `time: item.time`；`test.doSubmit` 的 `lastResult` 也带 `time: record.time`；`_computeTestTimes(allHist, id, selectedTime)` 显式接收所选记录时间（或 `rid` 定位记录），不要依赖 `myHist[0]`。

### N5 · 主题 AUTO 模式失效（P1）

**证据**

- `theme-store.getSystemTheme()` 只读 `wx.getWindowInfo().theme` 与 `wx.getDeviceInfo().theme`；
- 按微信官方文档，`theme` 在 `wx.getSystemInfoSync()` 返回值中；`getWindowInfo/getDeviceInfo` 不提供该字段；
- `app.json` 未声明 `darkmode` / `themeLocation`。

**实测**

```text
mock getSystemInfoSync().theme = 'dark'
getSystemTheme() → 'light'
```

**影响**：用户选择「跟随系统」后，系统深色模式不会生效；手动选深色正常。

**建议**：在 `getSystemTheme()` 中优先读 `wx.getSystemInfoSync().theme`，并保留现有 API 作为兜底；如需响应系统切换，按官方要求补 `app.json` 的 `darkmode: true` 与 `themeLocation`，或明确把 AUTO 降级为「跟随系统（首次启动读取）」。补主题单测，覆盖 dark/light/不支持三种情况。

### N6 · 训练播放页首屏最佳成绩错误（P2）

**证据**：`pages/train/game.js:73`

```js
bestText: fmtBest(trainStore.best(this.data.gameId, level, g.metric.better), g.metric.unit)
```

同一 `setData` 中才写入 `gameId: id`，此时 `this.data.gameId` 仍为 `''`，查询键变成 `ma_train___3`。

**影响**：Hero 的「维度 · 最佳」恒为「暂无记录」；难度芯片的 `levelsWithBest` 用 `id` 计算，显示正确，造成同页信息矛盾。

**建议**：改用局部变量 `id`；补测试：预置一条成绩后加载页面，断言 `data.bestText` 含实际最佳值。

### N7 · 「历史最佳」方向语义错误（P2）

**证据**：`pages/detail/detail.js:69-70`

```js
const nums = mine.map((h) => parseFloat(h.summary)).filter((n) => !isNaN(n))
if (nums.length >= 2) info.best = { summary: String(Math.max.apply(null, nums)) }
```

**影响**：GAD-7 / PHQ-9 / SDS / SAS / PSS / PSQI / UCLA 等「越低越好」的量表，最大值被标为「历史最佳」；用户可能把最差状态当作改善目标。

**建议**：在模块 `resultLayout` 增加 `better: 'higher' | 'lower' | 'none'`（或独立 `metric` 元数据），详情页按方向取 min/max；类型型量表隐藏「最佳」，改显示「最近类型」或「测评次数」。这是数据语义问题，优先级可高于普通 UI 缺陷。

### N8 · 交卷评分缺少异常保护（P2）

**证据**：`pages/test/test.js:746-749`

```js
wx.removeStorageSync(SK.PROGRESS_PREFIX + this.data.meta.id)
const r = this.mod.computeResult(...)
```

**影响**：任一模块因旧答案格式/数据异常抛错，页面直接崩溃；此时进度已删除，用户无法恢复。结果页虽然有 try/catch，但根本不会跳转。

**建议**：先 `try` 计算、成功后再删进度并写历史；失败时保留进度、`showModal` 提示并提供「重试/返回」。可复用结果页的兜底视图。

### N9 · 文档与实现漂移（P2）

| 位置 | 审查时现状 | 实际 / 本轮处理 |
| --- | --- | --- |
| 根 README（旧） | 34 个游戏 / 14 套量表 / UniApp + server 结构 | 36 / 27 / 仅原生小程序；**本轮已重写** |
| `wechat-miniprogram/README.md` | 「22 个方法」、注意力 8、`ma_train_<id>`、路线图已完成项仍标未做 | 24 个方法 / 注意力 9 / `ma_train_<id>__<level>`；**本轮已修正** |
| `about.js` 数据来源 | 手工维护 9 条来源 | 27 套量表；未列 PHQ-9/PSQI/PSS/UCLA 等（属「精选来源」而非完整清单） |
| `tools/gen-game-player.js` 注释 | 「31 个 wx:if」 | 36 个（仅注释，不影响生成结果） |
| `docs/brain-games-catalog.md` | 「全部 36 已落地」但 A5 图形追踪、A6 数字密码未实现 | 实际游戏以 registry 为准；**本轮已标注候选/已落地状态与存储键** |

**建议**：文档计数尽量从 `getMetaList().length` / `METHODS.length` / `gameReg.getMetaList().length` 生成（About 页已如此），README 在发布前跑一次计数核对；`about.js` 的来源列表改为「精选文献」表述或按模块聚合，避免用户误以为是全部来源。

### N10 · 保存图片的隐私封装不一致（P3）

`pages/result/result.js` 的 `saveCard` 使用 `withPrivacy`，而 `pages/detail/detail.js` 与 `pages/methods/detail.js` 的 `saveCard` 直接调用 `saveToAlbum`。微信 2.32.3+ 对相册写入有隐私授权要求，虽然 `registerPrivacyModal` 可兜底，但行为不一致，低版本/审核场景容易出问题。

**建议**：把 `withPrivacy` 收进 `share.saveToAlbum`，或三处统一包裹；补一条静态/单测断言。

### N11 · 回归测试缺口（P3）

当前 284 项 Jest 全绿，但以下场景没有测试：

- 训练记录 `time` 语义（N1）；
- 测评历史配额兜底（N2）；
- 进行中测评的时间与排序（N3）；
- 从历史打开旧记录的时间/GAP（N4）；
- 主题 AUTO 的系统深色分支（N5）；
- 详情页「历史最佳」方向（N7）。

**建议**：每修一个 P0/P1 补一条最小回归，优先覆盖 `train-store`、`history`、`theme-store`、`detail`。覆盖率门槛可从 60/45 逐步提到 70/55。

### N12 · 根目录遗留工程配置（P3）

仓库根 `project.config.json` 没有 `miniprogramRoot`，AppID（`wxcb1a…`）与 `wechat-miniprogram/project.config.json`（`wx2150…`）也不一致。它没有实际作用，却会让「导入仓库根目录」的开发者遇到「找不到 app.json」的编译错误。

**建议**：删除根配置文件，或补 `"miniprogramRoot": "wechat-miniprogram/"` 并统一 AppID；同时在 README 明确「必须导入 `wechat-miniprogram/` 子目录」（本轮已补说明）。

---

## 4. 历史修复档案（F1–F19）

以下为前几轮审查已落地的问题，保留用于追溯；当前代码已不再包含这些缺陷。

| # | 问题 | 结果 |
| --- | --- | --- |
| F1 | `profile.save()` 崩溃（`GENDERS` 未导入、云同步函数未导出） | 已修 |
| F2 | ESLint 将 `getCurrentPages` 报 `no-undef` | 已修 |
| F3 | `result/mine/theme-store` 未用导入/变量 | 已清 |
| F4 | 文档「23 套/22 个」不一致 | 已同步 |
| F5 | 云同步 UI 误导用户 | 已移除，明确纯本地 |
| F6 | `theme.js` 过度设计 | 精简为 `isDark()` |
| F7 | `applyTheme` 冗余 | 删除 |
| F8 | lint warnings | 清零 |
| F9 | 趋势图日期重叠 | 按间隔采样 |
| F10 | 方法练习无趋势图 | 已补 canvas 趋势 |
| F11 | 无严格 lint 门槛 | `lint:strict` + CI |
| F12 | 反向计分双实现 | 收敛到 `utils/reverse.js` |
| F13 | 答题进度节流窗口丢失 | `onHide/onUnload` 强制落盘 |
| F14 | 4 个游戏定时器泄漏 | 全量补 `detached` 清理 |
| F15 | `progressKey/trainKey` 死代码 | 删除 |
| F16 | `SCHEMA_VERSION` 双写 | 收敛到 `utils/constants.js` |
| F17 | 云同步占位死代码 | 删除，保留纯本地 |
| F18 | 主包混入开发文件 | `packOptions.ignore` 补全 |
| F19 | 结果页重复绘制/`onLoad` 过重 | 收拢到 `onReady` + `_computeTestTimes` |

---

## 5. 改进路线图

### P0 · 数据正确性（建议立即处理）

- [ ] **N1 训练记录时间戳**：拆分 `time`（记录时间）与 `elapsed`（游戏耗时），兼容旧数据，补回归。
- [ ] 交卷流程「先算分、后删进度、再写历史」，失败可重试（N8 的一部分）。

### P1 · 用户可见的正确性

- [ ] **N2** `const trimmed` → `let`，并补配额兜底测试。
- [ ] **N3** 进度写入 `updatedAt`，历史页按真实时间排序/展示。
- [ ] **N4** 归档记录传递 `time`/`rid`，结果页按所选记录计算时间与 GAP。
- [ ] **N5** 修复主题 AUTO 检测（`getSystemInfoSync().theme` + `darkmode` 配置/降级说明）。
- [ ] **N7** 为量表补充 `better` 方向元数据，修正「历史最佳」。

### P2 · 体验与工程化

- [ ] **N6** 训练播放页用局部 `id` 计算首屏最佳，补预置记录测试。
- [ ] **N9** 文档/About/注释计数自动化或发布前核对。
- [ ] **N10** 保存图片统一走 `withPrivacy`。
- [ ] **N11** 补齐 6 类回归测试，逐步提高覆盖率门槛。
- [ ] 测评历史上限从全局 30 条提升到 50–100，或按量表分别限流；给用户清理入口。
- [ ] 结果页/详情页增加「数据版本/常模版本」可见说明。
- [ ] `SCHEMA_VERSION` 改为「全局 + 每模块」双版本，模块题量/计分变更时精确提示。

### P3 · 架构与可维护性

- [ ] `test.js`（约 790 行）拆分：答题状态机、计时器、canvas 绘制、交卷存储分别抽模块。
- [ ] `history.load()` 不在列表阶段把 `answers` 全量放进 `data`，打开时按 `rid` 读取，降低内存。
- [ ] `train.js onShow` 避免在双重循环里重复 `gamesByDim()`，一次取 meta map。
- [ ] `relations.js` 的维度推荐从「取每维前 2 个」改为显式 id 配置或权重表，减少新增游戏后的关联漂移。
- [ ] 逐步引入 TypeScript（从 `utils/registry`、`game-registry`、`train-store` 开始）。
- [ ] 考虑把 `games/`、`modules/` 拆子包，为素材增长留空间（当前主包仍低于 2M，非紧急）。
- [ ] **N12** 删除根目录遗留 `project.config.json`，或补 `miniprogramRoot` 并统一 AppID。

### 数据 / 科学（长期）

- [ ] 常模按年龄/性别分组，标注版本与文献链接；当前仅为教育近似值。
- [ ] 训练成绩与量表结果不做因果/诊断解释，保持免责声明与「训练热身」定位。
- [ ] 若未来接云同步：补 `wx.cloud` 分支、迁移/冲突策略与隐私合规测试。

---

## 6. 本轮文档更新

- 根 `README.md`：重写为当前真实状态，移除已不存在的 UniApp/server/部署说明，补 27/24/36/14 计数、测试命令与文档索引。
- `wechat-miniprogram/README.md`：修正方法数（22→24）、游戏维度分组（注意力 9 + 逻辑计算 1）、存储键（`ma_train_<id>__<level>`）、测试计数与路线图。
- 新增 `docs/ARCHITECTURE.md`：分层、业务流、数据模型、模块/游戏契约、生成文件与扩展指南。
- `docs/brain-games-catalog.md`：澄清「36 个已落地」与候选清单的差异，更新存储键说明。
- 本文件：刷新基线，新增 N1–N12，重排 P0–P3 路线图。

---

## 7. 审查结论

当前工程的模块化、测试与生成式接线在同类小程序中属于较完整水平，基线可稳定运行。**最值得优先处理的是 N1**：它不是样式问题，而是会让训练历史、趋势和「最近训练」同时失真的数据层缺陷；其次是 N2–N5 这组用户可见的时间/主题/记录语义问题。修复这些后再做文档计数自动化与测试补强，收益最高。
