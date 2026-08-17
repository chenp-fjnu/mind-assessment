# 心智测评中心（Mind Assessment）· 微信小程序

纯前端**原生**微信小程序，集成 **14 套心理学量表**，支持离线测评、本地保存、结果可视化与同量表历史趋势对比。无后端、无网络请求，所有数据仅存于本地 `Storage`。

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
├── modules/                          # 14 个量表模块（每个 index.js 自包含）
│   ├── mbti/ big5/ epq/ disc/ pf16/  # 人格 / 性格
│   ├── sds/ sas/ gad7/ dass21/       # 情绪筛查
│   ├── ses/ las/                     # 自我认知
│   ├── holland/                      # 职业兴趣
│   ├── spm/                          # 瑞文图形推理（questions.js 懒加载）
│   └── wechsler/                     # 韦氏智力（积木题含真实候选图形数据）
├── pages/
│   ├── index/                        # 首页：分类量表 + 最近测评
│   ├── detail/                       # 量表说明页
│   ├── test/                         # 答题页（量表题 / 选择题 / 矩阵题 / 图形四选一）
│   ├── result/                       # 结果页（维度 / 双极 / 分测验 / 解读 / 趋势 / 存图）
│   └── history/                      # 全部测评记录（按量表筛选 / 单条删除 / 清空）
├── utils/
│   ├── registry.js                   # 模块注册表与查询（getModule / modulesByType）
│   ├── figure.js                     # canvas 图形渲染（circle/square/triangle/…）
│   ├── scoring.js                    # SPM 评分与常模（百分位→IQ）
│   ├── scale-scoring.js              # 通用量表评分（反向计分 / 求和 / 百分比 / 等级）
│   └── questions.js                  # SPM 60 题数据（大文件，懒加载）
└── test/
    ├── smoke.js                      # 纯 Node 评分链路冒烟测试（无需依赖）
    ├── modules.test.js               # Jest 模块单测
    └── index.page.test.js            # @miniprogram/simulate UI 渲染测试
```

---

## 14 套量表一览

| 模块 id | 名称 | 类别 | 题数 | 题型 | 主结果字段 |
| --- | --- | --- | --- | --- | --- |
| `mbti` | MBTI 人格 | 人格性格 | 28 | 选择 | 人格类型 |
| `big5` | 大五人格 | 人格性格 | 25 | 量表 | 五维画像 |
| `epq` | EPQ 艾森克 | 人格性格 | 48 | 选择 | 人格类型 |
| `disc` | DISC 行为风格 | 职业兴趣 | 24 | 选择 | 行为风格 |
| `pf16` | 卡特尔 16PF | 人格性格 | 48 | 量表 | 十六因素画像 |
| `sds` | 抑郁自评 SDS | 情绪筛查 | 20 | 量表 | 抑郁指数 |
| `sas` | 焦虑自评 SAS | 情绪筛查 | 20 | 量表 | 焦虑指数 |
| `gad7` | 广泛性焦虑 GAD-7 | 情绪筛查 | 7 | 量表 | 焦虑评分 |
| `dass21` | DASS-21 | 情绪筛查 | 21 | 量表 | 情绪综合评估 |
| `ses` | 自尊量表 SES | 自我认知 | 10 | 量表 | 自尊得分 |
| `las` | 领导风格 LAS | 自我认知 | 24 | 量表 | 主导风格 |
| `holland` | 霍兰德职业兴趣 | 职业兴趣 | 48 | 量表 | 职业代码 |
| `spm` | 瑞文推理 SPM | 智力推理 | 60 | 矩阵 | 智商估算 IQ |
| `wechsler` | 韦氏智力 WAIS | 智力推理 | 30 | 选择(含图形) | 总智商 FSIQ |

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
  // 以下为可选的结果视图构造器（鸭子类型）：
  buildGroupList?(r, layout),
  buildDimensionList?(r),
  buildSubtestList?(r),
  buildInterpretations?(r, groups, dims),
}
```

> 说明：部分模块的 `buildInterpretations` 第二/三参数命名不同（`groupList` / `scaleDimensionList`），但 `result.js` 统一以 `buildInterpretations(r, groups, dims)` 调用，多余参数被忽略，接口兼容。

### 结果页渲染流程（`pages/result/result.js`）
1. 从 `globalData.lastResult` 取 `{ id, answers }`（首页/详情/历史跳转前写入）。
2. `getModule(id).computeResult(answers, questions)` 得到 `r`。
3. 依 `resultLayout.primaryField` 取主结果；通过「函数是否存在」鸭子类型构造 `groups / dims / subtests / interpretations`。
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
| 冒烟（评分链路） | `node test/smoke.js` | 无 | 14 模块评分 + 韦氏候选完整性 + 复刻 result.js 构造流程，**52 项** |
| 模块单测 | `npm run test:simulate` → Jest `modules.test.js` | jest | 模块评分断言 |
| UI 渲染 | `npm run test:simulate` → Jest `index.page.test.js` | @miniprogram/simulate | 页面结构与绑定断言 |

CI（`.github/workflows/ci.yml`）：push/PR 触及 `wechat-miniprogram/**` 时于 Node 18 跑冒烟测试。

---

## 改进路线图（Roadmap）

按优先级排列，供后续迭代参考：

### 高优先 · 架构健壮性
1. **统一结果视图契约**：把 `result.js` 的鸭子类型分支收敛为模块可选实现 `getResultView(r)` → 返回标准化视图模型 `{ primary, level, desc, sections:[...] }`，页面只渲染。新模块零样板、避免漏接 `build*` 导致白屏。
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

## 许可

教育 / 演示用途。量表名称与版权归原作者与出版方所有，本实现仅作技术演示。
