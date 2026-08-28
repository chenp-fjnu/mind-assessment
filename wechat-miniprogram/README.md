# 心智探索局（Mind Quest）· 微信小程序

纯前端**原生**微信小程序，集成 **23 套心理学量表**（人格、情绪、智力、职业、自我认知、压力、睡眠、社交、积极心理等 9 大类），并在「训练」Tab 内置 **31 个脑力训练游戏**（注意力 / 工作记忆 / 反应速度 / 放松正念 / 执行功能 5 大认知维度）；支持离线测评、本地保存、结果可视化与同量表历史趋势对比。无后端、无网络请求，所有数据仅存于本地 `Storage`。

> ⚠️ 免责声明：所有量表均为**简化 / 教育版**自陈问卷，计分与常模为公开资料整理的近似值，仅供自我探索与娱乐参考，不构成任何医学诊断或专业建议。

---

## 运行方式

1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 「导入项目」→ 目录选择本仓库的 **`wechat-miniprogram/`** 文件夹。
3. AppID 选择「测试号」（`touristappid`，已在 `project.config.json` 中配置）或填写你自己的 AppID。
4. 基础库建议 **3.0.0+**（已开启 `lazyCodeLoading: requiredComponents` 按需注入）。

---

## 目录结构

```
wechat-miniprogram/
├── app.js / app.json / app.wxss      # 全局逻辑、页面注册、全局样式（含深色模式 CSS 变量）
├── project.config.json / sitemap.json
├── package.json                      # 测试脚本与开发依赖
├── modules/                          # 23 个量表模块（每个 index.js 自包含）
│   ├── mbti/ big5/ epq/ disc/ pf16/  # 人格 / 性格
│   ├── sds/ sas/ gad7/ dass21/       # 情绪筛查
│   ├── ses/ las/                     # 自我认知
│   ├── holland/                      # 职业兴趣
│   ├── spm/                          # 瑞文图形推理（questions.js 懒加载）
│   └── wechsler/                     # 韦氏智力（积木题含真实候选图形数据）
├── games/                            # 训练游戏（每个 <id>/ 含 index.js 逻辑 + game.js 组件，共 31 个）
│   ├── schulte/ cancellation/ visual-search/ find-rule/ figure-tracking/ number-maze/ mirror/ number-code/   # 注意力（8）
│   ├── memory-match/ pattern-memory/ simon/ digit-span/ corsi/ n-back/                                    # 工作记忆（6）
│   ├── stroop/ reaction-time/ flanker/ whack/ go-no-go/ bigger-number/ cps/ color-match/ double-decision/  # 反应速度（9）
│   ├── box-breathing/ breath-478/ resonance/ mindfulness/                                                  # 放松正念（4）
│   └── hanoi/ task-switch/ wisconsin/ tower-london/                                                        # 执行功能（4）
├── pages/
│   ├── index/                        # 首页：分类量表 + 最近测评 + 方法/训练精选入口
│   ├── assess/                       # 「测评」Tab：按类别（9 大类）浏览全部 23 套量表 + 搜索
│   ├── detail/                       # 量表说明页（含详解、参考来源/计分方式、关联方法/训练）
│   ├── test/                         # 答题页（量表题 / 选择题 / 矩阵题 / 图形四选一）
│   ├── result/                       # 结果页（维度 / 双极 / 分测验 / 解读 / 趋势 / 存图）
│   ├── history/                      # 全部记录（测评 + 方法练习，按 tab 筛选 / 删除 / 清空）
│   ├── methods/                      # 「方法」Tab：22 个心智方法知识库 + 搜索/分类
│   │   ├── methods.js                #   方法列表页
│   │   ├── detail.js                 #   方法详情（正文/步骤/贴士/示例，可启动互动练习）
│   │   └── practice.js               #   互动练习：按 method.schema 填表并记录到 ma_practices
│   ├── about/                        # 关于页：数据来源、隐私入口、各板块数量统计
│   ├── mine/                         # 「我的」Tab：测评/方法/训练记录汇总、主题切换、云同步占位入口
│   ├── profile/                      # 个人档案：微信头像/昵称/性别/生日（本地保存）
│   └── train/                        # 训练 Tab：train 列表页 + game 通用播放器
├── utils/
│   ├── registry.js                   # 模块注册表与查询（getModule / getMetaList / modulesByType）
│   ├── modules-meta.js               # 23 量表轻量元数据（type/icon/reference/scoring 等）
│   ├── game-registry.js              # 训练游戏注册表（getGame / gamesByDim / getMetaList）
│   ├── train-store.js                # 训练成绩存储（ma_train_<id>，趋势复用 trend.js）
│   ├── relations.js                  # 跨域关联：测评→相关方法/训练（详情页/结果页复用）
│   ├── methods-data.js               # 22 个方法知识库（METHODS / getMethod / recommendFor）
│   ├── assess-intro.js               # 各量表结构化「测评详解」文案
│   ├── result-view.js                # 统一结果视图标准化（getResultView 兜底）
│   ├── trend.js                      # 同量表/同练习历史趋势计算
│   ├── figure.js                     # canvas 图形渲染（circle/square/triangle…+色盲纹理）
│   ├── canvas.js                     # 结果卡/长图/趋势图绘制（含深色模式适配）
│   ├── scoring.js                    # SPM 评分与常模（百分位→IQ）
│   ├── scale-scoring.js              # 通用量表评分（反向计分 / 求和 / 百分比 / 等级）
│   ├── questions.js                  # SPM 60 题数据（大文件，懒加载）
│   ├── color.js                      # hexToRgba / 可读文字色（唯一颜色工具）
│   ├── theme.js                      # 设计系统色板（PALETTE/SEMANTIC，目前仅 isDark 被使用）
│   ├── theme-store.js                # 主题状态管理（跟随系统/浅色/深色 + 原生 UI 同步）
│   ├── user.js                       # 本地用户档案 + 记录存储（云同步为占位实现）
│   ├── privacy.js                    # 隐私授权弹窗与协议入口
│   ├── format.js / device.js / share.js / labels.js   # 小工具
└── test/
    ├── smoke.js                      # 纯 Node 评分链路冒烟测试（无需依赖）
    ├── modules.test.js               # Jest 模块单测
    └── index.page.test.js            # @miniprogram/simulate UI 渲染测试
```

---

## 23 套量表一览

| 模块 id | 名称 | 类别 | 题数 | 题型 | 主结果字段 |
| --- | --- | --- | --- | --- | --- |
| `mbti` | MBTI 人格测试 | 人格性格 | 70 | 选择 | 人格类型 |
| `big5` | 大五人格测试 | 人格性格 | 50 | 量表 | 人格画像 |
| `epq` | 艾森克人格问卷 | 人格性格 | 48 | 选择 | 人格类型 |
| `disc` | DISC 行为风格测评 | 职业兴趣 | 36 | 选择 | 行为风格 |
| `pf16` | 卡特尔 16PF 人格测验 | 人格性格 | 160 | 量表 | 人格画像 |
| `sds` | 抑郁自评量表 | 情绪筛查 | 20 | 量表 | 抑郁指数 |
| `sas` | 焦虑自评量表 | 情绪筛查 | 20 | 量表 | 焦虑指数 |
| `gad7` | 广泛性焦虑量表 | 情绪筛查 | 7 | 量表 | 焦虑评分 |
| `dass21` | 情绪综合量表 | 情绪筛查 | 21 | 量表 | 情绪综合评估 |
| `ses` | 自尊量表 | 自我认知 | 10 | 量表 | 自尊得分 |
| `las` | 爱情态度量表 | 自我认知 | 42 | 量表 | 主导风格 |
| `holland` | 霍兰德职业兴趣测试 | 职业兴趣 | 48 | 量表 | 职业代码 |
| `spm` | 瑞文标准推理测验 | 智力推理 | 60 | 矩阵 | 智商估算 IQ |
| `wechsler` | 韦氏智力测验 | 智力推理 | 48 | 选择(含图形) | 总智商 FSIQ |
| `phq9` | PHQ-9 抑郁筛查 | 情绪筛查 | 9 | 量表 | 抑郁评分 |
| `pss` | 压力知觉量表 | 压力应对 | 10 | 量表 | 压力评分 |
| `psqi` | 匹兹堡睡眠质量指数 | 睡眠健康 | 16 | 量表 | 睡眠指数 |
| `gses` | 一般自我效能感量表 | 自我认知 | 10 | 量表 | 自我效能 |
| `ucla` | UCLA 孤独量表 | 社交关系 | 20 | 量表 | 孤独评分 |
| `cdrise` | 心理韧性量表 | 积极心理 | 10 | 量表 | 韧性评分 |
| `enneagram` | 九型人格测试 | 人格性格 | 36 | 量表 | 主导类型 |
| `temperament` | 气质类型问卷 | 人格性格 | 60 | 量表 | 气质类型 |
| `hbdi` | HBDI 全脑优势测评 | 人格性格 | 40 | 选择 | 全脑优势 |

---

## 训练游戏模块（脑力训练）

除 23 套自评量表外，小程序新增独立 **「训练」Tab**，提供类舒尔特方格的互动脑力训练游戏，覆盖全部认知维度。所有游戏均为**离线、本地记录、无后端**，仅供自我探索与训练热身，不构成医学诊断。

### 已落地游戏（31 个，每维度多个）

| 游戏 id | 名称 | 维度 | 玩法 | 主指标 |
| --- | --- | --- | --- | --- |
| `schulte` | 舒尔特方格 | 注意力 | N×N 网格按 1→N 顺序点选（3×3~9×9） | 用时↓ |
| `cancellation` | 数字划消 | 注意力 | 矩阵中划掉目标数字（8×8/10×10） | 用时↓ |
| `visual-search` | 视觉搜索 | 注意力 | 相似色块中找不同（3×3~5×5） | 用时↓ |
| `find-rule` | 按要求找方格 | 注意力 | 按颜色规则点选方格（5×5~7×7） | 用时↓ |
| `figure-tracking` | 图形追踪 | 注意力 | 沿 1→N 数字轨道顺序点击 | 用时↓ |
| `number-maze` | 数字迷宫 | 注意力 | 从起点走到终点的迷宫（4×4~7×7） | 步数↓ |
| `mirror` | 镜像沙漏 | 注意力 | 判断两图是否互为镜像（10~20 题） | 得分↑ |
| `number-code` | 数字密码 | 注意力 | 记并复现数字序列（4~8 位） | 得分↑ |
| `memory-match` | 记忆配对 | 工作记忆 | 翻牌找成对图案（6~16 对） | 用时↓ |
| `pattern-memory` | 方块记忆 | 工作记忆 | 记住并复现高亮方块（4~10 格） | 得分↑ |
| `simon` | 序列记忆 | 工作记忆 | 复述闪烁色块顺序（3~9 步） | 得分↑ |
| `digit-span` | 数字广度 | 工作记忆 | 复现数字序列（4~10 位） | 得分↑ |
| `corsi` | 科西方块 | 工作记忆 | 依序点出点亮方块（3~6 步） | 得分↑ |
| `n-back` | N-Back | 工作记忆 | 判断当前方块是否同 N 步前（N=1~3） | 得分↑ |
| `stroop` | 斯特鲁普 | 反应速度 | 选墨水颜色而非词义（10~30 题） | 得分↑ |
| `reaction-time` | 反应时间 | 反应速度 | 屏幕变绿尽快点击（5~20 次） | 平均反应↓ |
| `flanker` | Flanker 侧抑制 | 反应速度 | 按中间箭头方向忽略干扰（10~30 题） | 得分↑ |
| `whack` | 打地鼠 | 反应速度 | 地鼠冒头尽快点击（10~20 只） | 命中↑ |
| `go-no-go` | Go-NoGo | 反应速度 | 绿点要按、红点要忍（8~24 题） | 得分↑ |
| `bigger-number` | 更大数字挑战 | 反应速度 | 点出更大的数字（1~3 位） | 得分↑ |
| `cps` | 连点 CPS | 反应速度 | 限时内尽快连点（5~15 秒） | 点击数↑ |
| `color-match` | 颜色匹配冲刺 | 反应速度 | 看色块点对应颜色名（5~15 题） | 得分↑ |
| `double-decision` | 双重决策 | 反应速度 | 蓝按方向红按反方向（6~18 题） | 得分↑ |
| `box-breathing` | 箱式呼吸 | 放松正念 | 4-4-4-4 节律引导呼吸（3~8 轮） | 轮数↑ |
| `breath-478` | 4-7-8 呼吸 | 放松正念 | 吸气4-屏息7-呼气8（3~8 轮） | 轮数↑ |
| `resonance` | 共振呼吸 | 放松正念 | 吸气4-呼气6（5~10 轮） | 轮数↑ |
| `mindfulness` | 正念呼吸 | 放松正念 | 缓吸缓呼跟引导语（4~8 轮） | 轮数↑ |
| `hanoi` | 汉诺塔 | 执行功能 | 整叠移到最右（3~5 盘） | 步数↓ |
| `task-switch` | 任务切换 | 执行功能 | 看颜色/看奇偶间切换作答（6~18 题） | 得分↑ |
| `wisconsin` | 威斯康星 | 执行功能 | 按维度归类卡片（4~12 题） | 得分↑ |
| `tower-london` | 伦敦塔 | 执行功能 | 最少步数达成目标排列（3 球） | 步数↓ |

### 架构与契约

- **注册表**：`utils/game-registry.js`（结构同 `utils/registry`，字面量 require 保证打包），提供 `getMetaList / gamesByDim / getGame`。
- **游戏实现**：`games/<id>/` 下含可单测的 `index.js`（纯逻辑 + 元数据）与 `game.js`（`Component` 组件，负责交互渲染）。统一契约：
  ```
  { id, name, dim, dimLabel, icon, color, desc, reference,
    levels:[{value,label}], metric:{key,label,unit,better},
    generate(level), score(state) }
  ```
- **播放器**：`pages/train/game` 通过 `usingComponents` 按 `gameId` 渲染对应组件，统一处理难度选择、计时、成绩保存、最佳/趋势展示。
- **列表页**：`pages/train/train` 按维度分区（注意力/工作记忆/反应速度/放松正念/执行功能），支持搜索与分类筛选。
- **成绩存储**：`utils/train-store.js`，键 `ma_train_<id>`（上限 50 条），趋势复用 `utils/trend.js` 的 `computeTrend`。

> 资料与候选清单见 `docs/brain-games-catalog.md`（含数字划消、N-Back、Flanker、打地鼠、反应时间、4-7-8 呼吸等可后续增量补齐的游戏）。

---

---

## 产品功能总览（五大板块）

小程序以「测评 · 方法 · 训练」闭环组织，五个底部 Tab 对应 **首页 / 测评 / 方法 / 训练 / 我的**，外加非 Tab 的详情、结果、历史、关于、档案页。

| 板块 | 入口页 | 核心能力 | 本地存储键 |
| --- | --- | --- | --- |
| **测评** | `pages/assess`、`pages/index` | 23 套量表按 9 大类浏览/搜索 → 详情 → 答题 → 结果 → 趋势 | `ma_history`（≤30）、`ma_progress_<id>` |
| **方法** | `pages/methods` | 22 个心智方法知识库（含步骤/贴士/示例），部分支持「互动练习」按 `schema` 填表打卡 | `ma_practices`（≤50/方法） |
| **训练** | `pages/train` | 31 个脑力游戏，5 大认知维度，难度分级、计时、成绩与趋势 | `ma_train_<id>`（≤50） |
| **我的** | `pages/mine` | 三类记录汇总、主题切换（跟随系统/浅/深）、云同步占位入口 | `user-theme-preference`、`ma_user` |
| **档案** | `pages/profile` | 微信头像/昵称/性别/生日本地档案 | `ma_user` |
| **关于** | `pages/about` | 数据来源、隐私协议入口、各板块数量统计 | — |

### 跨域关联（测评 ↔ 方法 ↔ 训练）

`utils/relations.js` 统一计算某量表对应的推荐方法与训练游戏（按 `type`/特定 id 映射到训练维度），供**详情页**（`detail.js` 调 `buildLinks`）与**结果页**（`result.js` 调 `relatedMethods`/`relatedGames`）复用，形成「认识自己 → 怎么用 → 练起来」的闭环，避免各页重复写关联逻辑。

### 主题与无障碍

- `utils/theme-store.js` 提供「跟随系统 / 浅色 / 深色」三模式，通过 `useTheme(page)` 注入 `themeClass`（页面根节点 `theme-wrapper` 应用），并同步原生 `tabBar`/`navigationBar`；`wx.onThemeChange` 在 AUTO 模式下实时切换。
- `utils/theme.js` 是集中色板（`PALETTE`/`SEMANTIC`/`GRADIENTS`）与 `isDark()`，后者被 `canvas.js` 用于深色模式绘制；页面样式以 `app.wxss` 的 CSS 变量为主。
- 图形/矩阵题选项叠加序号/字母徽标与色盲纹理（`utils/figure.js` 的 `COLOR_TEXTURE`），兼顾色盲用户。

### 用户档案与「云同步」

`utils/user.js` 维护本地用户档案（`ma_user`）与记录集合（`ma_records`），结构上预留了微信云开发同步（字段对齐 openid/unionid、`syncUserToCloud`/`syncRecordToCloud`）。**当前云调用为占位实现（返回 `Promise.resolve()`），未实际接入后端**，相关同步 UI（mine/profile 的「同步状态」）仅作演示。如需上线需补充 `wx.cloud.init` 与云函数。

---

## 架构设计

### 模块契约（约定大于配置）
每个量表模块 `module.exports` 暴露统一接口，页面与工具据此渲染，互不耦合：

```js
module.exports = {
  id, type, name, shortName, desc, icon, color,
  duration, questionCount, paid, price, tag,
  questionType,                 // 'scale' | 'choice' | 'matrix'
  resultLayout,                 // { primaryField, primaryLabel, groupLabels, ... }
  getQuestions(),               // 返回渲染所需的题目数组
  computeResult(answers, questions),  // 纯函数，返回评分结果对象
  // 结果视图构造器（统一契约，必实现）：
  getResultView(r, layout),     // 返回标准化视图模型，页面只渲染
}
```

> 说明：`getResultView(r, layout)` 返回统一结构
> `{ groups:[], dims:[], subtests:[], interpretations:[], showBipolar:boolean }`：
> - `groups`：`{ key, label, percent, display?, isScale? }`
> - `dims`：标量 `{ key, name, percent?, text? }` 或双极 `{ key, name, leftName, rightName, leftPercent, rightPercent, dominant, dominantDesc? }`（含 `leftPercent` 即双极，`showBipolar` 由首元素推断）
> - `subtests`：`{ name, correct, total, scalePercent? }`
> - `interpretations`：`{ title, text }`
> 页面（`result.js`）与 `test/smoke.js` 统一调用，不再依赖多方法鸭子类型分支。

### 结果页渲染流程（`pages/result/result.js`）
1. 从 `globalData.lastResult` 取 `{ id, answers }`（首页/详情/历史跳转前写入）。
2. `getModule(id).computeResult(answers, questions)` 得到 `r`。
3. 依 `resultLayout.primaryField` 取主结果；调用模块 `getResultView(r, layout)` 统一构造 `groups / dims / subtests / interpretations`。
4. 读取 `ma_history` 计算**同量表趋势**：数值型（`/^\d+(\.\d+)?$/`）画折线图，类型型显示历史 chips。
5. 统一渲染维度条、双极维度（MBTI）、分测验（韦氏）、解读与趋势。

### 存储约定
- `ma_history`：测评记录数组（含 `id/name/icon/time/answers/summary/level`），上限 **30** 条，最新在前。
- `ma_progress_<id>`：未完成进度，提交后自动清除；进入答题页时若存在则弹「继续 / 重新开始」。

### 图形渲染
- `utils/figure.js`：`drawCell(ctx, cell, x, y, size)` 支持 circle/square/triangle/diamond/hexagon/star/plus 与 solid/hollow/striped/dotted 填充。
- 韦氏积木题的 4 个候选图形（含正确项）由**模块数据层** `candidates` 直接定义（`sq`/`tri`/`g2` 辅助构造），不再运行时合成。

---

## 关键特性

- **自动跳题**：量表/选择题选完 350ms、矩阵题 700ms 后自动进入下一题；末题自动提交确认。
- **分组进度**：SPM 按 A–E 组展示进度，跨组时弹「本组答对 X/Y」。
- **续答**：未完成退出后可从进度恢复。
- **韦氏真实图形四选一**：积木题以红/蓝/绿/黄 2×2 图形呈现，正确项即目标图案。
- **结果保存卡片**：`canvas` 绘制结果卡 → `saveImageToPhotosAlbum` 存相册。
- **历史趋势对比**：同量表多次测评的数值折线 / 类型记录。
- **深色模式**：全站 CSS 变量 + `@media (prefers-color-scheme: dark)`。
- **无障碍**：交互元素 `role="button"` + `aria-label`，图形 canvas `role="img"`。
- **分享**：详情/答题/结果页均可转发。

---

## 测试

| 测试 | 命令 | 依赖 | 说明 |
| --- | --- | --- | --- |
| 冒烟（评分链路） | `npm test`（`node test/smoke.js`） | 无 | 23 模块评分 + 韦氏候选完整性 + `getResultView` 视图构造流程，**158 项** |
| 模块单测 | `npm run test:simulate` → Jest `modules.test.js` | jest | 模块评分 / 候选 / 选项数断言 |
| 工具单测 | `npm run test:simulate` → Jest `utils.test.js` | jest | `color`/`scoring`/`trend`/`result-view`/`registry`/`figure`/`methods-data` 纯函数、模块契约（`getResultView` 标准化结构、23 量表 `reference`/`scoring` 非空）、图形色盲纹理 |
| 页面单测 | `npm run test:simulate` → Jest `index.page.test.js` | jest | `detail`/`result`/`index`/`test` 页面 `onLoad` 渲染数据（基于 mock 运行时 `wx`/`Page`，**无需** `@miniprogram/simulate`） |
| 全量 | `npm run test:all` | jest | 先跑冒烟再跑 Jest；`npm run test:coverage` 附覆盖率报告 |

覆盖率门槛（jest.config.js）：语句/行 35%、分支/函数 25%；当前全仓约 **59% 语句 / 61% 行**（工具与模块层多数 >80%，页面层随页面单测逐步提升）。

CI（`.github/workflows/ci.yml`）：push/PR 触及 `wechat-miniprogram/**` 时于 Node 18 依次跑 `npm test`（冒烟）与 `npm run test:coverage`（Jest + 覆盖率）。

> 说明：早期 `index.page.test.js` 依赖 `@miniprogram/simulate`（源中已不可用），现已改为基于 `test/setup.js` 的轻量 mock 运行时 + `test/page-helper.js` 加载页面并执行 `onLoad`，零额外重依赖、可在 Node 直接运行。

---

## 改进路线图（Roadmap）

按优先级排列，供后续迭代参考：

### 高优先 · 架构健壮性
1. **统一结果视图契约**：把 `result.js` 的鸭子类型分支收敛为模块统一实现 `getResultView(r, layout)` → 返回标准化视图模型 `{ groups, dims, subtests, interpretations, showBipolar }`，页面只渲染。新模块零样板、避免漏接 `build*` 导致白屏。**（已完成：23 个模块全部迁移，回退分支已移除）**
2. **`computeResult` 容错**：`result.js` 用 try/catch 包裹评分，异常时显示兜底结果而非整页崩溃（尤其旧版 `answers` 格式变更时）。
3. **趋势图增强**：数值趋势补 x 轴日期标签、>N 条时支持缩放；类型趋势展示「最近一次 vs 首次」变化。

### 中优先 · 体验 / 数据
4. 结果页补充「测评时间」与「距上次重测间隔」提示。
5. 历史记录导出 / 备份（JSON 到剪贴板或文件）。
6. 详情页显式「继续未完成的测评」入口（进度百分比），而非仅在进入答题时弹窗。
7. 首页增加量表搜索 / 分类筛选。
8. 详情页直接展示该量表「历史最佳 / 上次成绩」对比入口。

### 低优先 · 工程化
9. 增加 ESLint + Prettier 与 `npm run lint`；仓库加 `.gitattributes`（`* text=auto`）统一行尾（当前提交有 CRLF 警告）。
10. CI 增加 Jest + `@miniprogram/simulate` 完整链路（当前仅跑冒烟，因 simulate 安装较重）。
11. 抽出 `utils/trend.js` 把趋势计算从 `result.js` 移出，便于单测。
12. `detail.js` 移除未使用的 `type: mod.questionType` 字段。

### 数据 / 科学（可选）
13. 部分量表 `trait`/`type` 长字符串作为主指标可读性一般（big5 / pf16 / dass21），可改为「短标签 + 详情展开」。
14. 常模与计分公式补充来源文献与版本号，便于后续校准。

---

## 已落地改进（Changelog）

- **文档同步**：README 量表清单由 14 套更正为 **23 套**，题数/分类与代码元数据（`utils/modules-meta.js`）一致。
- **结果页「用时」修复**：`pages/test/test.js` 将 `totalTime` 持久化进 `ma_history` 与 `globalData.lastResult`，`pages/result/result.js` 回读展示（此前因重算时未传 timings 而恒为空）。
- **历史容量保护**：写入超 `Storage` 配额时自动丢弃最旧记录兜底；历史记录增加 `schemaVersion` 字段便于后续兼容。
- **代码去重**：`hexToRgba` 抽至 `utils/color.js`，消除 `index/assess/methods` 三处重复实现。
- **分享卡片双极维度**：`utils/canvas.js` 的 `renderCard` 现支持 MBTI 等双极维度（左/右分裂条 + 主导极）。
- **自动跳题参数化**：图形/矩阵题自动跳入延迟由 700ms 延长至 900ms，普通量表题保持 350ms。
- **隐私合规增强**：`utils/privacy.js` 新增 `openPrivacyContract`，`about` 页提供「查看隐私保护指引」入口（需在小程序后台配置隐私协议）。
- **死代码清理**：移除全部 23 个模块中从未被调用的 `getDimensionLabel` 定义。
- **工程化**：新增 ESLint + Prettier 配置、`.editorconfig` 与 `npm run lint` / `npm run format`，统一行尾与格式。
- **架构统一（全量迁移）**：`utils/result-view.js` 收敛为 `getResultView(mod, r, layout)` 统一入口，所有 23 个模块的 `buildGroupList`/`buildDimensionList`/`buildScaleDimensionList`/`buildSubtestList`/`buildInterpretations` 已**合并删除**，改为各模块单一 `getResultView(r, layout)`；结果结构统一为 `{ groups, dims, subtests, interpretations, showBipolar }`，页面与 smoke 共用（路线图第 1 项，已消除所有鸭子类型分支）。
- **来源标注**：`utils/modules-meta.js` 为每个量表补充 `reference`（标准化版本/常用文献），详情页新增「参考来源与版本」区块（路线图第 14 项）。
- **色盲无障碍**：图形/矩阵题选项 canvas 叠加**序号徽标**，除颜色外以编号区分选项，兼顾色盲用户与快速定位。
- **趋势对比增强**：`utils/trend.js` 数值趋势补充「首次/最近」值与区间差；类型趋势新增「首次 → 最近」对比（路线图第 3 项）。
- **结果视图统一契约**：23 个模块全部实现单一 `getResultView(r, layout)`（零鸭子类型分支），`utils/result-view.js` 仅做标准化兜底；返回结构 `{ groups, dims, subtests, interpretations, showBipolar }`（路线图第 1 项，已完成）。
- **色盲无障碍（图形）**：`utils/figure.js` 支持图形单元 `label` 叠加（白字+深色描边，任意底色可读）；韦氏积木 `sq`/`tri` 按颜色自动打标（R/W/B/G/Y），色盲用户可凭字母而非仅颜色区分积木。
- **色盲无障碍（形状/纹理）**：`utils/figure.js` 新增颜色→纹理冗余通道 `COLOR_TEXTURE`，`drawShape` 在 `fill` 未显式设置时按颜色推导纹理（红=striped/蓝=dotted/绿=hollow/黄= solid），颜色同时带可辨纹理；矩阵题选项画布叠加可见字母徽标（A–F），色盲无需依赖颜色即可区分选项（路线图色盲项）。
- **常模/计分文献标注**：`utils/modules-meta.js` 为 22 个量表补充 `scoring` 字段（计分方式与常模说明），详情页「参考来源与版本」区块新增展示「计分方式」，便于溯源与校准（路线图第 14 项）。
- **结果页重测提示**：`pages/result/result.js` 展示「距上次测评 N 天 / 首次测评」，便于跟踪变化。
- **详情页续答入口**：`pages/detail/detail.wxml` 在存在未完成进度时显示「继续未完成测评（已答 X/Y，Z%）」按钮，点击即恢复（路线图第 6 项）。
- **首页搜索与分类筛选**：`pages/index` 新增搜索框（按名称/简称/简介/标签匹配）与按 `type` 的分类 chips，实时过滤「全部量表」列表，含空态提示（路线图第 7 项）。
- **测试体系完善**：新增 `jest.config.js` + `test/setup.js`（mock 运行时 `wx`/`Page`/`Component`）+ `test/page-helper.js`（加载页面并执行 `onLoad`）；`utils.test.js` 补足工具层单测，`index.page.test.js` 改为零依赖页面单测；`npm run test:all` 串联冒烟与 Jest、`test:coverage` 附覆盖率；新增 `.github/workflows/ci.yml`（Node 18 跑冒烟 + Jest）。移除源中不可用的 `@miniprogram/simulate` 依赖。
- **代码清理**：ESLint 清零（修复 `figure.js` switch-case 词法声明、`gen-tab-icons.js` 常量条件；`result.js`/`audit-questions.js` 改用 `const`）；删除 23 模块迁移遗留的未用 `makeLabeler` 导入与 `DIM_LABELS` 常量等死代码；合并 `test/unit.js`/`assert.js`/`simulate.js` 冗余断言到 Jest 后删除。
- **训练游戏模块（新增「训练」Tab）**：`app.json` 注册第五个底部导航（新增 train 图标由 `tools/gen-tab-icons.js` 生成）；`pages/train` 列表页（按认知维度分区 + 搜索/筛选）+ 通用播放器 `pages/train/game`；首批 4 个游戏 `games/{schulte,memory-match,stroop,box-breathing}`，统一 `index.js` 纯逻辑 + `game.js` 组件契约；`utils/game-registry.js` 注册表与 `utils/train-store.js` 本地成绩存储（趋势复用 `utils/trend.js`）；详见 `docs/brain-games-catalog.md` 候选清单。
- **训练游戏扩充（+3）**：新增 `reaction-time`（反应时间）、`n-back`（视觉位置 N-Back）、`flanker`（侧抑制）三个游戏，覆盖反应速度/工作记忆维度更多范式；`game-registry.js` 注册、`pages/train/game` 播放器 `usingComponents` 与 `wx:if` 分支同步接入，`test/games.test.js` 单测增至 18 项。
- **训练游戏全量落地（共 31 个）**：按 `docs/brain-games-catalog.md` 候选清单补齐全部 5 个认知维度——注意力（+7：数字划消/视觉搜索/按要求找方格/图形追踪/数字迷宫/镜像沙漏/数字密码）、工作记忆（+4：方块记忆/序列记忆 Simon/数字广度/科西方块）、反应速度（+6：打地鼠/Go-NoGo/更大数字/连点CPS/颜色匹配/双重决策）、放松正念（+3：4-7-8 呼吸/共振呼吸/正念呼吸）、执行功能（+4：汉诺塔/任务切换/威斯康星/伦敦塔）；统一 `index.js` 纯逻辑 + `game.js` 组件契约，注册表/播放器/单测（`test/games.test.js` 现 46 项）与冒烟（`test/smoke.js` 152 项）同步通过，README「已落地游戏」表与目录结构更新。
- **首页与关于页同步训练内容**：首页 slogan 更新为「测评 · 方法 · 训练，陪你认识并锻炼心智」，顶部统计增加「{{gameCount}} 个训练」；新增第三个「脑力训练」入口 pillar 与「脑力训练」精选卡片区（直达 `pages/train/game`）。「关于」页新增「脑力训练」小节说明 31 个游戏与 5 大维度、本地成绩与趋势，并同步 slogan；首页/详情/结果/历史页脚 slogan 一并更新为「心智探索局 · 测评 · 方法 · 训练」。
- **代码审查与文档补全（code review）**：修复 `pages/profile/profile.js` 的 `save()` 崩溃（`GENDERS` 未导入、`syncUserToCloud` 未导出，实际为占位实现）；补全 README 五大板块/页面地图/跨域关联/主题/用户档案说明；修正 changelog 中遗留的「22 套」为「23 套」；清理 `result.js`/`mine.js`/`theme-store.js` 死代码并修正 ESLint `getCurrentPages` 全局声明，消除全部 lint error。详细审查结论与改进建议见 [`docs/CODE_REVIEW.md`](docs/CODE_REVIEW.md)。
- **改进建议落地（部分 P1–P3）**：① `utils/theme.js` 删除未使用的 `PALETTE`/`SEMANTIC`/`GRADIENTS`/`FUNCTIONAL`/`resolve`/`generateCSSVariables`，仅保留 `isDark()`（页面样式以 `app.wxss` CSS 变量为准）；② 新增 `utils/storage-keys.js` 集中定义所有存储键（`ma_history`/`ma_progress_*`/`ma_practices`/`ma_train_*`/`ma_user`/`ma_records`/主题键），替换散落在 13 个文件中的字符串字面量；③ CI（`ci.yml`）新增 `npm run lint` 门槛（非零即失败）；④ 首页收敛：移除与底部 Tab 重复的「三大板块入口」，改为「最近探索」跨板块去重记录（复用 `goHot`）；⑤ 结果趋势图在 >8 条时仍绘制首/尾日期标签。

> 路线图高/中优先项基本落地；CI 已接入 Jest + 覆盖率。**已知问题**：`utils/user.js` 云同步为占位实现（未接后端），相关同步 UI 仅作演示；`utils/theme.js` 色板目前仅 `isDark` 被使用，页面样式以 `app.wxss` CSS 变量为准；详见 [`docs/CODE_REVIEW.md`](docs/CODE_REVIEW.md)。

## 许可

教育 / 演示用途。量表名称与版权归原作者与出版方所有，本实现仅作技术演示。
