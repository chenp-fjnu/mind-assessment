# 心智探索局 · 架构与业务说明

> 更新日期：2026-11-18
> 适用工程：[`wechat-miniprogram/`](../README.md)
> 规模基线：27 套量表 / 24 个方法 / 36 个训练游戏 / 16 个页面

本文说明当前代码的分层、业务流程、数据模型和扩展方式，供后续维护与二次开发使用。问题清单与优先级见 [`CODE_REVIEW.md`](CODE_REVIEW.md)。

---

## 1. 定位与边界

| 项 | 约定 |
| --- | --- |
| 形态 | 原生微信小程序（WXML/WXSS/JS + `Component`） |
| 运行 | 纯前端、离线；**无后端、无 `wx.request`、无云开发、无登录** |
| 数据 | 全部写入本机 `Storage`；卸载、清缓存或换设备会丢失 |
| 计分 | 量表为简化/教育版；常模为公开资料近似值，不构成临床诊断 |
| 目标 | 「测评认识自己 → 方法知道怎么做 → 训练练起来 → 记录看变化」 |

---

## 2. 分层架构

```text
┌──────────────────────────── pages/ ────────────────────────────┐
│ 首页 index │ 课程 course/list/detail │ 测评 assess/detail/test/result │
│ 方法 methods/* │ 训练 train/game │ 记录 history │ 我的 mine/profile/about │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                               │
        ┌───────▼────────┐              ┌───────▼────────┐
        │ utils/registry │              │ utils/game-    │
        │ 懒加载量表模块  │              │ registry 懒加载 │
        └───────┬────────┘              └───────┬────────┘
                │                               │
        ┌───────▼────────┐              ┌───────▼────────┐
        │ modules/<id>/  │              │ games/<id>/    │
        │ 题库+评分+视图  │              │ 逻辑+组件       │
        └────────────────┘              └────────────────┘
                │                               │
        ┌───────▼───────────────────────────────▼────────┐
        │ utils：result-view / scale-scoring / scoring / │
        │ trend / train-store / canvas / figure / ...    │
        └───────────────────────┬────────────────────────┘
                                │
                        ┌───────▼────────┐
                        │ wx Storage 本地 │
                        └────────────────┘
```

### 目录职责

| 目录 | 职责 | 关键文件 |
| --- | --- | --- |
| `pages/` | 页面编排、交互、跳转、数据展示 | `test/test.js`、`result/result.js`、`train/game.js` |
| `modules/<id>/` | 单套量表：题目、计分、结果视图、元数据 | `index.js` |
| `games/<id>/` | 单个训练：关卡生成/计分（纯逻辑）+ 组件交互 | `index.js`、`game.js` |
| `utils/` | 注册表、存储、评分、趋势、绘图、主题、隐私等横切能力 | `registry.js`、`game-registry.js`、`train-store.js` |
| `test/` | 最小 `wx` mock 下的冒烟与 Jest 测试 | `smoke.js`、`setup.js`、`page-helper.js` |
| `scripts/` | CI 一致性闸门 | `check-meta.js`、`check-game-player.js` |
| `tools/` | 生成器（元数据、玩家页、图标、题库） | `gen-game-player.js`、`gen-meta.js` |

---

## 3. 业务流

### 3.1 测评闭环

```text
assess（分类/搜索）→ detail（详解/来源/关联/历史）
→ test（答题）→ result（评分/视图/趋势/存图）→ history（记录）
```

测评、方法、训练三个库页默认展示最多 4 个适合上手的内容，并补充最多 3 个目标路线必做内容；两组不重复，不把选做的敏感自评作为默认推荐。未选择目标时只展示有明确依据的精选补充。用户可展开完整列表，搜索与分类筛选仍作用于全量内容。

#### 答题页 `pages/test/test.js`

1. `getModule(query.id)` 懒加载模块，`getQuestions()` 取得题目。
2. 读取 `ma_progress_<id>`；存在且答案长度一致时弹「继续 / 重新开始」。
3. 每题支持 `scale` / `choice` / `matrix` / `multi` 四种题型；图形题用 canvas 绘制。
4. 自动跳题：普通题 350ms，图形/矩阵题 900ms；多选需手动确认。
5. 计时：
   - 单题 `timeLimit`（如 n808 25–35s、wechsler 60s）→ 到点自动下一题；
   - 整卷 `totalTimeLimit`（n808 900s）→ 以 `startedAt` 为起点，续答按已流逝时间扣减，到点自动交卷。
6. SPM 等带 `set` 的题组在跨组时弹「本组答对 X/Y」。
7. 交卷：`computeResult(answers, questions, { timings })` → 写入 `ma_history` → `reLaunch` 结果页。
8. 进度节流 2s 写入；`onHide`/`onUnload` 强制落盘（`_finished` 防止交卷后写回）。

#### 结果页 `pages/result/result.js`

1. 优先读 `getApp().globalData.lastResult`；冷启动时从 `ma_history` 找「题量一致」的最近记录恢复。
2. `computeResult` 与 `getResultView` 均有 try/catch 兜底，异常时显示「结果解析失败」，避免白屏。
3. 统一视图模型 `{ groups, dims, subtests, interpretations, showBipolar }` 直接渲染。
4. `computeTrend(allHist, id)` 计算同量表趋势；数值型画折线，类型型展示历史 chips。
5. `onReady` 统一绘制趋势图与分享卡片（避免重复绘制）。
6. `saveCard` 用 canvas 生成长图并保存相册；分享使用同一张卡片。
7. 关联推荐：`relations.relatedMethods/relatedGames`。

### 3.2 方法闭环

- `utils/methods-data.js` 维护 24 个方法（4 类：目标与行动、情绪与认知、习惯与行为、自我与成长）。
- 每个方法包含 `content/steps/tips/example` 与可选 `schema`；当前 24 个均 `interactive: true`。
- `practice.js` 按 `schema` 动态渲染表单（textarea / scale 等），保存到 `ma_practices[methodId]`（每方法 ≤50 条）。
- 方法详情与练习页都从首个 `scale` 字段计算「首次 → 最近」趋势并绘制折线图。

### 3.3 训练闭环

- `pages/train/train` 按 6 维度展示 36 个游戏，支持搜索与维度筛选；显示各游戏跨难度最佳。
- `pages/train/game` 是统一播放器：
  - `gameId` → `getGame` 取元数据；
  - `usingComponents` 与 `wx:if` 由 `tools/gen-game-player.js` 生成；
  - 难度、计时、结算芯片、最佳成绩、趋势、最近训练统一由宿主处理；
  - 需要「开始游戏」按钮的游戏在模块中声明 `showStartButton: true`，由宿主统一触发，保证计时公平。
- 成绩写入 `ma_train_<id>__<level>`（每难度 ≤50 条），最佳/趋势按难度隔离。
- 舒尔特方格额外按用户生日推算年龄组，与公开常模区间对比。

### 3.4 记录与个人中心

- `pages/history` 三个 Tab：测评 / 方法 / 训练；支持搜索、按量表筛选、删除单条、清空当前 Tab、JSON 导出到剪贴板。
- 「进行中」列表从 `ma_progress_*` 读取，可直接续答。
- `pages/mine` 汇总三类记录数量、主题切换、档案入口。
- `pages/profile` 本地保存头像/昵称/性别/生日；修改生日即时落盘（影响舒尔特年龄组）。
- `pages/about` 展示数据来源、隐私入口和各板块数量。

### 3.5 目标与课程路线

- 首页 (`pages/index`) 用本地目标决定课程入口与推荐排序；无历史的新用户看到目标引导，有历史但未选目标的用户看到欢迎回访入口。
- `pages/course/list` 展示 6 条目标路线，`pages/course/detail` 展示步骤、时长、必做/可选状态及继续入口。路线覆盖自我探索、专注练习、压力调节、行动启动、放松练习与沟通表达。
- `utils/courses-data.js` 从测评/方法/训练注册表解析课程内容；`scripts/check-meta.js` 的 `npm run validate` 检查引用是否有效。
- `utils/course-progress.js` 管理进度。活动成功保存后才标记对应步骤完成，不将课程开始前的旧记录回填为路线完成；`currentStepId` 指向待办步骤，完成度按必做步骤计算，可选步骤可跳过。课程详情可清除单条路线状态，不删除活动记录。
- 用户目标、引导状态和路线进度分别保存在 `ma_user_goal`、`ma_onboarding_done`、`ma_course_progress`，均为本地数据，不上传。
- 测评通过答题 URL 将 `courseId/stepId` 传给结果页（答题后使用 `wx.reLaunch`）；结果、方法练习和训练保存成功后更新课程进度。

---

## 4. 数据模型与存储

所有键集中定义在 `utils/storage-keys.js`。

| 键 | 结构 | 写入方 | 读取方 | 容量/说明 |
| --- | --- | --- | --- | --- |
| `ma_history` | `Array<Record>` | `test/test.js` | 首页、详情、结果、历史、我的 | ≤30 条，最新在前；超配额逐条丢弃最旧 |
| `ma_progress_<id>` | `{ answers, current, startedAt }` | `test/test.js` | 答题页、历史页 | 交卷即删；2s 节流 + 退出兜底 |
| `ma_practices` | `{ [methodId]: Entry[] }` | `methods/practice.js` | 首页、详情、历史、我的 | 每方法 ≤50 条 |
| `ma_train_<id>__<level>` | `Entry[]` | `train-store.js` | 训练列表/播放页/历史/首页 | 每难度 ≤50 条 |
| `ma_train_last` | `{ id, level, levelLabel, name, icon, color, dimLabel, time }` | `train-store.setLast` | 首页「继续训练」 | 单条 |
| `ma_user_goal` | `string` | 首页目标选择 | 首页、课程大厅、测评/方法/训练列表 | 本地推荐目标 |
| `ma_onboarding_done` | `boolean` | 首页目标引导 | 首页 | 已选择目标或选择先浏览 |
| `ma_course_progress` | `{ [courseId]: { currentStepId, completedStepIds, skippedStepIds, startedAt, updatedAt } }` | `course-progress.js` | 首页、课程列表/详情、测评结果、方法练习、训练播放页 | 仅存路线状态；不存活动成绩 |
| `ma_user` | `{ id, nickname, avatarUrl, gender, birthday, createdAt, updatedAt }` | `user.js` | 我的、档案、舒尔特年龄组 | 本地单用户 |
| `user-theme-preference` | `'auto' \| 'light' \| 'dark'` | `theme-store.js` | 全站 | — |
| `current-effective-theme` | `'light' \| 'dark'` | `theme-store.js` | 启动同步原生 UI | — |

### 记录结构

```js
// 测评记录 ma_history[i]
{
  rid, id, name, icon, time,          // rid/time 为记录标识与时间戳
  answers, qcount, summary, level,
  totalTime,                          // 答题耗时（毫秒）
  schemaVersion, userId
}

// 训练记录 ma_train_<id>__<level>[i]
{
  rid, level, time,                   // time 应为记录时间戳
  summary,                            // 主指标字符串
  levelLabel, errors, score, correct,
  total, rounds, moves, duration, userId
}
```

> **时间字段约定**：记录级 `time` 表示「记录发生时间」（毫秒时间戳）；游戏单局耗时使用独立字段（建议 `elapsed`/`duration`，秒）。`train-store.save` 的 `detail` 不应覆盖记录级 `time`，详见 `CODE_REVIEW.md` 的 N1。

### 版本与容量

- `SCHEMA_VERSION`（`utils/constants.js`）当前为 `1`，随测评记录写入；结果页读取时比对，不一致会提示「量表已更新」。
- 测评历史上限 30 条是**全局**上限，不是每量表；27 套量表长期使用可能偏紧。
- 写入失败时测评有配额兜底；训练记录也有丢最旧兜底，但存在缺陷（见 N2/N1）。

---

## 5. 模块契约

### 5.1 量表模块 `modules/<id>/index.js`

```js
module.exports = {
  id, type, name, shortName, desc, icon, color,
  duration, questionCount, tag,
  questionType,          // 'scale' | 'choice' | 'matrix' | 'multi'
  resultLayout: {
    primaryField,        // 主结果字段
    primaryLabel,        // 主结果标签
    // 可扩展：better: 'higher' | 'lower' | 'none'
  },
  totalTimeLimit,        // 可选：整卷限时（秒）
  getQuestions(),        // 返回带题型、选项、答案、计分元数据的题目
  computeResult(answers, questions, opts), // 纯函数
  getResultView(r, layout) // 必实现，返回统一视图模型
}
```

关键约定：

- `getQuestions()` 必须保留计分所需字段（如 MAP 的 `dim/trait/high`），不能只保留展示字段。
- 答案统一存**选项索引**；量表模块自行换算分值（`scale-scoring` 用 `raw + min`）。
- `getResultView` 返回 `{ groups, dims, subtests, interpretations, showBipolar }`，页面不再做鸭子类型分支。
- 新增模块需同步：`utils/registry.js` 的 LOADERS、`node tools/gen-meta.js`、`utils/assess-intro.js`、`utils/relations.js` 的映射、测试。

### 5.2 结果视图

```js
{
  groups: [{ key, label, percent, display?, isScale? }],
  dims: [
    { key, name, percent, text, level } |
    { key, name, leftName, rightName, leftPercent, rightPercent, dominant }
  ],
  subtests: [{ name, correct, total, scalePercent? }],
  interpretations: [{ title, text }],
  showBipolar: Boolean
}
```

- `utils/result-view.js` 的 `getResultView(mod, r, layout)` 做标准兜底；`mapDimensions` 统一维度映射。
- 双极维度（MBTI）由 `leftPercent/rightPercent` 识别，`showBipolar` 由首元素推断。

### 5.3 训练游戏 `games/<id>/index.js`

```js
{
  id, name, dim, dimLabel, icon, color, desc, reference,
  levels: [{ value, label }],
  metric: { key, label, unit, better: 'lower' | 'higher' },
  showStartButton,       // 可选：需要宿主统一开始按钮（计时类）
  family,                // 可选：'breath' 呼吸族复用组件
  generate(level),       // 纯函数，返回关卡数据
  score(state)           // 纯函数，返回 { 主指标, time/errors/score/... }
}
```

组件 `game.js` 通过 `triggerEvent('finish', result)` 回传结果；宿主负责保存、最佳、趋势、结算芯片。组件必须：

- 在 `properties.level` 变化时重置；
- 在 `lifetimes.detached` 清理所有 `setTimeout/setInterval/audio`；
- 使用 `catchtouchmove` 防止滚动吞掉点击（播放器已统一处理棋盘容器）。

### 5.4 生成文件与闸门

| 文件 | 生成器 | 校验 |
| --- | --- | --- |
| `utils/modules-meta.js` | `tools/gen-meta.js` | `scripts/check-meta.js` |
| `pages/train/game.json` | `tools/gen-game-player.js` | `scripts/check-game-player.js` |
| `pages/train/games-block.wxml` | 同上 | 同上 |
| `assets/tabicons/*` | `tools/gen-tab-icons.js` | — |

**不要手改**上述生成文件；新增/删除游戏后运行生成器并提交，否则 CI 失败。

---

## 6. 横切能力

| 能力 | 实现 | 说明 |
| --- | --- | --- |
| 主题 | `theme-store.js` + `app.wxss` CSS 变量 | 跟随系统/浅色/深色；`theme-wrapper` 根节点；同步原生 tabBar/导航栏 |
| 隐私 | `privacy.js` + `app.json __usePrivacyCheck__` | 启动注册全局弹窗；相册/剪贴板用 `withPrivacy` 包裹；关于页打开官方协议 |
| 分享 | `share.js` / `canvas.js` | 详情/方法生成内容卡；结果生成完整长图；`onShareTimeline` 同步 |
| 无障碍 | 页面 `role`/`aria-label` + `figure.js` 纹理/徽标 | `test/a11y.test.js` 静态断言交互元素标签 |
| 设备 | `device.js` | DPR、基础库版本、chooseAvatar 能力检测 |
| 音效 | `sound.js` | 训练游戏点击/错误反馈，跟随系统音量 |

---

## 7. 测试与质量门

```text
npm run validate     → check-meta（模块/题量/视图契约）+ check-game-player（生成一致性）
npm test             → test/smoke.js（纯 Node 评分链路，182 项）
npm run test:simulate→ Jest（14 suites / 308 tests）
npm run test:coverage→ Jest + 覆盖率门槛（60/45/65/65）
npm run lint:strict  → ESLint 0 error / 0 warning
npm run test:all     → validate + smoke + Jest coverage（CI 同款）
```

- `test/setup.js` 提供最小 `wx/Page/Component/App/getApp` mock 与 canvas noop。
- `test/page-helper.js` 用 `jest.isolateModules` 加载页面并执行 `onLoad`。
- 覆盖率现状为 66.43% 语句 / 47.82% 分支 / 71.79% 函数 / 67.97% 行；`theme-store.js`、`tri808.js`、`scoring.js` 是主要缺口。

---

## 8. 扩展指南

### 新增一套量表

1. 新建 `modules/<id>/index.js`，实现题目、`computeResult`、`getResultView`、`resultLayout`。
2. 在 `utils/registry.js` 的 `LOADERS` 加**字面量 require**。
3. 运行 `node tools/gen-meta.js` 更新 `utils/modules-meta.js`。
4. 在 `utils/assess-intro.js` 补测评详解；在 `utils/relations.js` 补方法/训练映射（可选）。
5. 在 `test/modules.test.js` / `test/smoke.js` 覆盖题数、边界计分、视图结构。
6. 更新 README 量表表与计数。

### 新增一个训练游戏

1. 新建 `games/<id>/`：`index.js`（元数据/generate/score）、`game.js`（Component）、`game.wxml`、`game.wxss`、`game.json`。
2. 在 `utils/game-registry.js` 的 `LOADERS` 登记；如需新维度，同时更新 `DIM_LABELS` 与 `pages/train/train.js` 的 `DIM_ORDER`。
3. 运行 `node tools/gen-game-player.js` 重新生成 `game.json` / `games-block.wxml`。
4. 补 `test/games.test.js`（生成/计分/边界/单调性）与 `test/train.page.test.js`（分组/总数/chips）。
5. 更新 README 游戏表、`docs/brain-games-catalog.md`、首页热门配置（可选）。

### 新增一个方法

1. 在 `utils/methods-data.js` 的 `METHODS` 增加条目（`category/summary/content/steps/tips/example`）。
2. 如需互动练习，增加 `interactive: true` 与 `schema` 字段；练习页会自动渲染。
3. 方法列表/详情/练习由数据驱动，无需改页面；补充 `utils.test.js` 的 methods-data 断言即可。

---

## 9. 已知约束

- 训练记录 `time` 字段语义、历史「上次编辑」时间、主题 AUTO 检测等已知问题见 [`CODE_REVIEW.md`](CODE_REVIEW.md) 第 3 节。
- 当前无数据导入；历史导出仅复制 JSON 到剪贴板。
- 云同步未接入；`ma_user` 为纯本地档案。
- 量表常模为近似值，未按年龄/性别分组；「历史最佳」对越低越好的量表语义不准确。
