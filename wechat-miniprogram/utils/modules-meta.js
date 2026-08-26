// 自动生成：轻量元数据，仅供首页/分类列表使用，避免启动即加载全部题库
// 如需更新，运行 node tools/gen-meta.js
module.exports = [
  {
    "id": "mbti",
    "type": "personality",
    "name": "MBTI 人格测试",
    "shortName": "MBTI",
    "icon": "🧠",
    "color": "#7c3aed",
    "desc": "基于荣格类型论的 16 型人格测试，了解你的思维与行为偏好。",
    "questionCount": 70,
    "duration": 20,
    "tag": [
      "人格",
      "性格",
      "自我认知"
    ],
    "reference": "Myers, I.B. & Briggs, K.C. — MBTI® 类型指标；本题源为公开领域 70 题标准化版整理（简体中文译）",
    "scoring": "四维度二分计分（E/I、S/N、T/F、J/P），按题项倾向归类型，无临床常模",
    "hot": true
  },
  {
    "id": "big5",
    "type": "personality",
    "name": "大五人格测试",
    "shortName": "Big Five",
    "icon": "🌟",
    "color": "#0891b2",
    "desc": "基于 OCEAN 五因素模型的人格测评，评估开放性、尽责性、外向性、宜人性、神经质五个维度。",
    "questionCount": 50,
    "duration": 10,
    "tag": [
      "人格",
      "性格",
      "OCEAN"
    ],
    "reference": "Goldberg, L.R. — IPIP-50 大五人格量表（OCEAN 五因素模型）",
    "scoring": "0–5 Likert 累加法，按维度 T 分／百分位常模",
    "hot": true
  },
  {
    "id": "epq",
    "type": "personality",
    "name": "艾森克人格问卷",
    "shortName": "EPQ",
    "icon": "🔬",
    "color": "#4338ca",
    "desc": "基于艾森克人格问卷的简化版测评，评估外向性、神经质、精神质与掩饰性四个维度。",
    "questionCount": 48,
    "duration": 10,
    "tag": [
      "人格",
      "性格",
      "EPQ"
    ],
    "reference": "Eysenck, H.J. & Eysenck, S.B.G. — EPQ-RSC 艾森克人格问卷（简式中文版，E/N/P/L 四量表）",
    "scoring": "是/否计分（含 L 掩饰量表），标准 T 分常模（E/N/P/L 四量表）",
    "hot": false
  },
  {
    "id": "disc",
    "type": "career",
    "name": "DISC 行为风格测评",
    "shortName": "DISC",
    "icon": "📊",
    "color": "#0891b2",
    "desc": "基于 DISC 模型的行为风格测评，评估支配、影响、稳健、谨慎四种行为特质。",
    "questionCount": 36,
    "duration": 8,
    "tag": [
      "行为风格",
      "职场",
      "沟通"
    ],
    "reference": "Marston, W.M. — DISC 行为风格模型（Dominance/Influence/Steadiness/Conscientiousness）",
    "scoring": "四因子倾向计分，按主导风格归类",
    "hot": false
  },
  {
    "id": "pf16",
    "type": "personality",
    "name": "卡特尔 16PF 人格测验",
    "shortName": "16PF",
    "icon": "🎯",
    "color": "#be185d",
    "desc": "基于卡特尔 16 种人格因素模型的测评，全面评估 16 个独立人格维度及次元特征。",
    "questionCount": 160,
    "duration": 20,
    "tag": [
      "人格",
      "性格",
      "16因素"
    ],
    "reference": "Cattell, R.B. — 16PF 卡特尔十六种人格因素问卷（IPIP 版因子题）",
    "scoring": "0–2 计分累加法，按 16 因素标准十（stens）常模",
    "hot": false
  },
  {
    "id": "sds",
    "type": "mood",
    "name": "抑郁自评量表",
    "shortName": "SDS",
    "icon": "💙",
    "color": "#2563eb",
    "desc": "基于 Zung 抑郁自评量表，评估近一周的抑郁情绪程度，输出抑郁指数与严重度分级。",
    "questionCount": 20,
    "duration": 10,
    "tag": [
      "情绪",
      "抑郁",
      "心理健康",
      "筛查"
    ],
    "reference": "Zung, W.W.K. (1965) — 抑郁自评量表（SDS）",
    "scoring": "20 题 1–4 Likert 累加法，抑郁指数=总分×1.25，常模分级",
    "hot": true
  },
  {
    "id": "sas",
    "type": "mood",
    "name": "焦虑自评量表",
    "shortName": "SAS",
    "icon": "💛",
    "color": "#ea580c",
    "desc": "基于 Zung 焦虑自评量表，评估近一周的焦虑情绪程度，输出焦虑指数与严重度分级。",
    "questionCount": 20,
    "duration": 10,
    "tag": [
      "情绪",
      "焦虑",
      "心理健康",
      "筛查"
    ],
    "reference": "Zung, W.W.K. (1971) — 焦虑自评量表（SAS）",
    "scoring": "20 题 1–4 Likert 累加法，焦虑指数=总分×1.25，常模分级",
    "hot": true
  },
  {
    "id": "gad7",
    "type": "mood",
    "name": "广泛性焦虑量表",
    "shortName": "GAD-7",
    "icon": "⚡",
    "color": "#f59e0b",
    "desc": "基于 GAD-7 广泛性焦虑量表，评估近两周的广泛性焦虑程度，输出总分与严重度分级。",
    "questionCount": 7,
    "duration": 5,
    "tag": [
      "情绪",
      "焦虑",
      "心理健康",
      "筛查"
    ],
    "reference": "Spitzer, R.L. et al. (2006) — 广泛性焦虑量表（GAD-7）",
    "scoring": "7 题 0–3 Likert 累加法，总分常模分级（≥10 轻中度）",
    "hot": false
  },
  {
    "id": "dass21",
    "type": "mood",
    "name": "情绪综合量表",
    "shortName": "DASS-21",
    "icon": "🎯",
    "color": "#7c3aed",
    "desc": "基于 DASS-21 抑郁焦虑压力复合量表，同时评估抑郁、焦虑、压力三个维度，输出各维度严重度分级。",
    "questionCount": 21,
    "duration": 10,
    "tag": [
      "情绪",
      "抑郁",
      "焦虑",
      "压力",
      "心理健康",
      "筛查"
    ],
    "reference": "Lovibond, S.H. & Lovibond, P.F. (1995) — 抑郁-焦虑-压力量表（DASS-21）",
    "scoring": "21 题 0–3 Likert 累加法，三维度分量表计分，常模分级",
    "hot": false
  },
  {
    "id": "ses",
    "type": "self",
    "name": "自尊量表",
    "shortName": "SES",
    "icon": "💪",
    "color": "#0d9488",
    "desc": "基于 Rosenberg 自尊量表，评估整体自我价值感与自我接纳程度。",
    "questionCount": 10,
    "duration": 5,
    "tag": [
      "自我",
      "自尊",
      "自我价值"
    ],
    "reference": "Rosenberg, M. (1965) — 自尊量表（SES）",
    "scoring": "10 题 4 点计分（反向题校正），总分累加法，常模分级",
    "hot": false
  },
  {
    "id": "las",
    "type": "self",
    "name": "爱情态度量表",
    "shortName": "LAS",
    "icon": "❤️",
    "color": "#be185d",
    "desc": "基于 Lee 的爱情色彩理论，测查你在亲密关系中的 6 种爱情风格倾向。",
    "questionCount": 42,
    "duration": 8,
    "tag": [
      "自我",
      "爱情",
      "亲密关系"
    ],
    "reference": "Hendrick, C. & Hendrick, S. (1986) — 爱情态度量表（LAS，六型浪漫风格）",
    "scoring": "42 题 Likert 计分，六型爱情风格分量表累加法",
    "hot": false
  },
  {
    "id": "holland",
    "type": "career",
    "name": "霍兰德职业兴趣测试",
    "shortName": "Holland",
    "icon": "💼",
    "color": "#059669",
    "desc": "基于霍兰德 RIASEC 模型的职业兴趣测评，评估六种职业兴趣类型并生成职业代码。",
    "questionCount": 48,
    "duration": 15,
    "tag": [
      "职业",
      "兴趣",
      "RIASEC"
    ],
    "reference": "Holland, J.L. — RIASEC 霍兰德职业兴趣理论（现实/研究/艺术/社会/企业/常规）",
    "scoring": "48 题 Likert 计分，RIASEC 六型累加成职业代码",
    "hot": true
  },
  {
    "id": "spm",
    "type": "intelligence",
    "name": "瑞文标准推理测验",
    "shortName": "SPM",
    "icon": "🧩",
    "color": "#1e3a8a",
    "desc": "国际通用的非言语智力测验，通过图形规律推理评估抽象思维能力。",
    "questionCount": 60,
    "duration": 40,
    "tag": [
      "智力",
      "图形",
      "非言语"
    ],
    "reference": "Raven, J.C. — 瑞文标准推理测验（SPM）；本题为原创图形推理练习，按正确率换算近似推理水平，非标准化常模",
    "scoring": "60 题正确率计分，按正确数换算近似推理水平，非标准化常模",
    "hot": false
  },
  {
    "id": "wechsler",
    "type": "intelligence",
    "name": "韦氏智力测验",
    "shortName": "WAIS",
    "icon": "📐",
    "color": "#0d9488",
    "desc": "基于 WAIS 的简化版智力测验，含言语与操作两类共 6 个分测验。",
    "questionCount": 48,
    "duration": 25,
    "tag": [
      "智力",
      "言语",
      "操作",
      "综合"
    ],
    "reference": "Wechsler, D. — 韦氏成人智力量表（WAIS）；本题为原创分测验图形练习，按正确率换算近似量表分，非标准化常模",
    "scoring": "分测验正确率计分，换算近似量表分，非标准化常模",
    "hot": false
  },
  {
    "id": "phq9",
    "type": "mood",
    "name": "PHQ-9 抑郁筛查",
    "shortName": "PHQ-9",
    "icon": "🌧️",
    "color": "#0891b2",
    "desc": "基于 DSM-IV 抑郁诊断标准的 9 题抑郁筛查，评估近两周抑郁症状严重程度。",
    "questionCount": 9,
    "duration": 5,
    "tag": [
      "情绪",
      "抑郁",
      "筛查",
      "DSM-IV"
    ],
    "reference": "Kroenke, K. et al. (2001) — 患者健康问卷抑郁模块（PHQ-9）",
    "scoring": "9 题 0–3 Likert 累加法，总分常模分级（≥10 中重度）",
    "hot": false
  },
  {
    "id": "pss",
    "type": "stress",
    "name": "压力知觉量表",
    "shortName": "PSS-10",
    "icon": "🌪️",
    "color": "#dc2626",
    "desc": "基于 PSS-10 的压力知觉测评，评估近一个月你感知到的压力程度与应对感受。",
    "questionCount": 10,
    "duration": 5,
    "tag": [
      "压力",
      "应激",
      "心理健康",
      "筛查"
    ],
    "reference": "Cohen, S., Kamarck, T. & Mermelstein, R. (1983) — 知觉压力量表（PSS-10）",
    "scoring": "10 题 0–4 Likert 计分（反向题校正），总分累加法，常模分级",
    "hot": false
  },
  {
    "id": "psqi",
    "type": "sleep",
    "name": "匹兹堡睡眠质量指数",
    "shortName": "PSQI",
    "icon": "🌙",
    "color": "#4f46e5",
    "desc": "基于 PSQI 的睡眠质量测评，从 7 个维度评估你近一个月的睡眠质量。",
    "questionCount": 16,
    "duration": 8,
    "tag": [
      "睡眠",
      "健康",
      "生活质量",
      "筛查"
    ],
    "reference": "Buysse, D.J. et al. (1989) — 匹兹堡睡眠质量指数（PSQI，7 个成分）",
    "scoring": "19 自评+5 他评，7 成分累加成总分（0–21），常模分级",
    "hot": false
  },
  {
    "id": "gses",
    "type": "self",
    "name": "一般自我效能感量表",
    "shortName": "GSES",
    "icon": "🔥",
    "color": "#0891b2",
    "desc": "基于 GSES 的自我效能测评，评估你面对挑战时相信自己能应付的总体信心。",
    "questionCount": 10,
    "duration": 5,
    "tag": [
      "自我",
      "自信",
      "自我效能",
      "积极心理"
    ],
    "reference": "Schwarzer, R. & Jerusalem, M. (1995) — 一般自我效能感量表（GSES）",
    "scoring": "10 题 4 点计分累加法，总分常模分级",
    "hot": false
  },
  {
    "id": "ucla",
    "type": "social",
    "name": "UCLA 孤独量表",
    "shortName": "UCLA",
    "icon": "🌫️",
    "color": "#7c3aed",
    "desc": "基于 UCLA 第三版的孤独感测评，评估你近期的社会联结与孤独体验。",
    "questionCount": 20,
    "duration": 6,
    "tag": [
      "社交",
      "孤独",
      "关系",
      "心理健康"
    ],
    "reference": "Russell, D. et al. (1978/1980 第三版) — UCLA 孤独量表",
    "scoring": "20 题 Likert 计分（反向题校正），总分累加法，常模分级",
    "hot": false
  },
  {
    "id": "cdrise",
    "type": "wellbeing",
    "name": "心理韧性量表",
    "shortName": "CD-RISC-10",
    "icon": "🌱",
    "color": "#059669",
    "desc": "基于 CD-RISC 简版的心理韧性测评，评估你面对压力与逆境时的复原能力。",
    "questionCount": 10,
    "duration": 5,
    "tag": [
      "积极心理",
      "韧性",
      "抗压",
      "自我成长"
    ],
    "reference": "Connor, K.M. & Davidson, J.R.T. (2003) — 心理韧性量表（CD-RISC-10）",
    "scoring": "10 题 5 点 Likert 累加法，总分常模分级",
    "hot": false
  },
  {
    "id": "enneagram",
    "type": "personality",
    "name": "九型人格测试",
    "shortName": "Enneagram",
    "icon": "🌀",
    "color": "#be185d",
    "desc": "基于九型人格理论的简化测评，探索你的主导人格类型与特质倾向。",
    "questionCount": 36,
    "duration": 10,
    "tag": [
      "人格",
      "性格",
      "九型",
      "自我探索"
    ],
    "reference": "Riso, D.R. & Hudson, R. — 九型人格理论（Enneagram，简化测评版）",
    "scoring": "36 题 Likert 计分，九型倾向累加成主导类型",
    "hot": false
  },
  {
    "id": "temperament",
    "type": "personality",
    "name": "气质类型问卷",
    "shortName": "气质类型",
    "icon": "🎭",
    "color": "#0d9488",
    "desc": "基于气质四维度的简化测评，探索你的先天行为风格与情绪反应倾向。",
    "questionCount": 60,
    "duration": 12,
    "tag": [
      "人格",
      "气质",
      "性格",
      "自我探索"
    ],
    "reference": "气质四维度问卷（简化版；基于希波克拉底-盖伦气质学说与现代四维模型）",
    "scoring": "60 题 Likert 计分，四气质类型累加成主导气质",
    "hot": false
  },
  {
    "id": "hbdi",
    "type": "personality",
    "name": "HBDI 全脑优势测评",
    "shortName": "HBDI",
    "icon": "🧠",
    "color": "#2563eb",
    "desc": "基于赫曼全脑模型，评估你分析、组织、共情、创新四大思维象限的优势剖面。",
    "questionCount": 40,
    "duration": 10,
    "tag": [
      "全脑",
      "思维风格",
      "职场",
      "自我探索"
    ],
    "reference": "Herrmann, N. — Whole Brain Model / HBDI® 全脑优势模型（本实现为公共领域全脑模型的教育简化版，非授权常模）",
    "scoring": "四象限倾向计分，输出象限剖面与左/右脑、上/下脑偏好",
    "hot": false
  }
]
