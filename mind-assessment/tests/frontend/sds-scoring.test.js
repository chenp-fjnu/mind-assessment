/**
 * SDS 抑郁自评量表 - 评分逻辑测试
 */
const sds = require('../../shared/modules/sds');

describe('SDS 抑郁自评量表模块', () => {
  const questions = sds.getQuestions();

  test('应有 20 道题', () => {
    expect(questions).toHaveLength(20);
  });

  test('量表应为 4 级 (1-4)', () => {
    questions.forEach((q) => {
      expect(q.scale.min).toBe(1);
      expect(q.scale.max).toBe(4);
    });
  });

  test('应包含 10 道反向计分题', () => {
    const reverse = questions.filter((q) => q.reverse);
    expect(reverse).toHaveLength(10);
  });

  test('反向题编号应为 2,5,6,11,12,14,16,17,18,20', () => {
    const reverseIds = questions.filter((q) => q.reverse).map((q) => q.id);
    const expected = ['SDS-02', 'SDS-05', 'SDS-06', 'SDS-11', 'SDS-12',
                      'SDS-14', 'SDS-16', 'SDS-17', 'SDS-18', 'SDS-20'];
    expect(reverseIds).toEqual(expect.arrayContaining(expected));
    expect(reverseIds).toHaveLength(10);
  });

  describe('评分逻辑', () => {
    test('全部选 4（绝大部分时间）→ 正向题得分高', () => {
      // 选项索引 3 对应值 4
      const answers = questions.map(() => 3);
      const result = sds.computeResult(answers, questions);
      // 正向题 val=4, 反向题 val=1 (5-4=1)
      // 10 正向 × 4 + 10 反向 × 1 = 40 + 10 = 50
      expect(result.raw).toBe(50);
      expect(result.index).toBe(Math.round(50 * 1.25)); // 63
    });

    test('全部选 1（没有或很少）→ 正向题得分低', () => {
      // 选项索引 0 对应值 1
      const answers = questions.map(() => 0);
      const result = sds.computeResult(answers, questions);
      // 正向题 val=1, 反向题 val=4 (5-1=4)
      // 10 正向 × 1 + 10 反向 × 4 = 10 + 40 = 50
      expect(result.raw).toBe(50);
      expect(result.index).toBe(Math.round(50 * 1.25)); // 63
    });

    test('全部选 3（相当多时间）→ raw 应为 60', () => {
      // 选项索引 2 对应值 3
      const answers = questions.map(() => 2);
      const result = sds.computeResult(answers, questions);
      // 正向题 val=3, 反向题 val=2 (5-3=2)
      // 10 × 3 + 10 × 2 = 30 + 20 = 50
      expect(result.raw).toBe(50);
    });

    test('全部选 2 → raw 应为 40', () => {
      // 选项索引 1 对应值 2
      const answers = questions.map(() => 1);
      const result = sds.computeResult(answers, questions);
      // 正向题 val=2, 反向题 val=3
      // 10 × 2 + 10 × 3 = 20 + 30 = 50
      expect(result.raw).toBe(50);
    });

    test('抑郁指数 = round(raw × 1.25)', () => {
      const answers = questions.map(() => 3);
      const result = sds.computeResult(answers, questions);
      expect(result.index).toBe(Math.round(result.raw * 1.25));
      expect(result.standardScore).toBe(result.index);
    });

    test('严重度分级应正确', () => {
      // 构造高抑郁指数：所有正向题选 4(索引3)，反向题也选 4
      // 正向 val=4, 反向 val=1, raw=50, index=63 → 中度
      const highAnswers = questions.map((q) => (q.reverse ? 0 : 3)); // 反向选1, 正向选4
      const highResult = sds.computeResult(highAnswers, questions);
      // 正向 10×4 + 反向 10×4 = 80, index = 100 → 重度
      expect(highResult.raw).toBe(80);
      expect(highResult.index).toBe(100);
      expect(highResult.level).toBe('重度抑郁');

      // 低抑郁：正向选1, 反向选1
      const lowAnswers = questions.map((q) => (q.reverse ? 3 : 0)); // 反向选4, 正向选1
      const lowResult = sds.computeResult(lowAnswers, questions);
      // 正向 10×1 + 反向 10×1 = 20, index = 25 → 无抑郁
      expect(lowResult.raw).toBe(20);
      expect(lowResult.index).toBe(25);
      expect(lowResult.level).toBe('无抑郁');
    });

    test('症状维度分组应正确', () => {
      const answers = questions.map(() => 3);
      const result = sds.computeResult(answers, questions);
      expect(result.groups).toHaveProperty('somatic');
      expect(result.groups).toHaveProperty('psychological');
      expect(result.groups).toHaveProperty('positive');
      expect(result.groupDetails.somatic.name).toBe('躯体症状');
      expect(result.groupDetails.psychological.name).toBe('心理症状');
      expect(result.groupDetails.positive.name).toBe('正向感受');
    });

    test('items 应记录每题得分', () => {
      const answers = questions.map(() => 2);
      const result = sds.computeResult(answers, questions);
      expect(result.items).toHaveLength(20);
      result.items.forEach((item) => {
        expect(item.answered).toBe(true);
        expect(item.value).toBe(3); // 索引 2 → 值 3
      });
    });

    test('跳过的题应标记为未作答', () => {
      const answers = questions.map((_, i) => (i < 10 ? 2 : null));
      const result = sds.computeResult(answers, questions);
      expect(result.totalStat.skipped).toBe(10);
      expect(result.items[10].answered).toBe(false);
      expect(result.items[0].answered).toBe(true);
    });
  });

  describe('模块方法', () => {
    test('buildGroupList 应返回 3 组', () => {
      const answers = questions.map(() => 2);
      const result = sds.computeResult(answers, questions);
      const groups = sds.buildGroupList(result, sds.resultLayout);
      expect(groups).toHaveLength(3);
      groups.forEach((g) => {
        expect(g).toHaveProperty('key');
        expect(g).toHaveProperty('label');
        expect(g).toHaveProperty('percent');
        expect(g).toHaveProperty('display');
        expect(g.isScale).toBe(true);
      });
    });

    test('buildInterpretations 应包含重要提示', () => {
      const answers = questions.map(() => 2);
      const result = sds.computeResult(answers, questions);
      const interp = sds.buildInterpretations(result);
      expect(interp.length).toBeGreaterThanOrEqual(3);
      const lastTitle = interp[interp.length - 1].title;
      expect(lastTitle).toBe('重要提示');
    });

    test('getDimensionLabel 应返回情绪状态', () => {
      expect(sds.getDimensionLabel('mood')).toBe('情绪状态');
    });
  });
});
