/**
 * 16PF 卡特尔人格因素 - 评分逻辑测试
 * P0-2: 答案以 0-based 索引存储，索引 0→分值1, 索引 4→分值5（min=1）
 */
const pf16 = require('../../shared/modules/pf16');

describe('16PF 卡特尔人格因素模块', () => {
  const questions = pf16.getQuestions();

  test('应有 48 道题', () => {
    expect(questions).toHaveLength(48);
  });

  test('应有 16 个因素各 3 题', () => {
    const factors = {};
    questions.forEach((q) => {
      factors[q.dimension] = (factors[q.dimension] || 0) + 1;
    });
    expect(Object.keys(factors)).toHaveLength(16);
    Object.values(factors).forEach((c) => expect(c).toBe(3));
  });

  test('16 个因素应包含 A-Q4', () => {
    const factors = [...new Set(questions.map((q) => q.dimension))];
    expect(factors).toContain('A');
    expect(factors).toContain('B');
    expect(factors).toContain('Q1');
    expect(factors).toContain('Q4');
  });

  describe('评分逻辑', () => {
    test('全部选 5 → 每因素 2 正向(5) + 1 反向(1) → percent=67', () => {
      // 索引 4 → 分值 5
      const answers = questions.map(() => 4);
      const result = pf16.computeResult(answers, questions);
      // 每因素: 2 非反向(5) + 1 反向(1) → avg=3.67 → percent=67
      Object.keys(result.factors).forEach((f) => {
        expect(result.factors[f].percent).toBe(67);
        expect(result.factors[f].level).toBe('high'); // > 65 阈值
      });
    });

    test('全部选 1 → 每因素 2 正向(1) + 1 反向(5) → percent=33', () => {
      // 索引 0 → 分值 1
      const answers = questions.map(() => 0);
      const result = pf16.computeResult(answers, questions);
      // 每因素: 2 非反向(1) + 1 反向(5) → avg=2.33 → percent=33
      Object.keys(result.factors).forEach((f) => {
        expect(result.factors[f].percent).toBe(33);
        expect(result.factors[f].level).toBe('low'); // <= 35 阈值
      });
    });

    test('按方向作答（正向选5反向选1）→ 所有因素 percent 应为 100', () => {
      // 非反向: 索引4(分值5), 反向: 索引0(分值1→翻转后5)
      const answers = questions.map((q) => (q.reverse ? 0 : 4));
      const result = pf16.computeResult(answers, questions);
      Object.keys(result.factors).forEach((f) => {
        expect(result.factors[f].percent).toBe(100);
      });
    });

    test('次元因素应正确计算', () => {
      // 索引 2 → 分值 3
      const answers = questions.map(() => 2);
      const result = pf16.computeResult(answers, questions);
      expect(result.secondary).toBeDefined();
      expect(result.secondary.anxiety).toBeDefined();
      expect(result.secondary.extroversion).toBeDefined();
      expect(result.secondary.sensitivity).toBeDefined();
      expect(result.secondary.anxiety.score).toBeGreaterThanOrEqual(0);
      expect(result.secondary.anxiety.score).toBeLessThanOrEqual(100);
    });

    test('trait 应包含所有因素的百分比', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = pf16.computeResult(answers, questions);
      expect(result.trait).toMatch(/A\d+/);
      expect(result.trait).toMatch(/Q4\d+/);
    });

    test('dimensions 应与 factors 相同', () => {
      // 索引 2 → 分值 3
      const answers = questions.map(() => 2);
      const result = pf16.computeResult(answers, questions);
      expect(result.dimensions).toBe(result.factors);
    });

    test('groups 应包含所有因素的 sum', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = pf16.computeResult(answers, questions);
      Object.keys(result.factors).forEach((f) => {
        expect(result.groups[f]).toBe(result.factors[f].sum);
      });
    });

    test('raw 应为所有因素 sum 之和', () => {
      // 索引 2 → 分值 3
      const answers = questions.map(() => 2);
      const result = pf16.computeResult(answers, questions);
      const total = Object.values(result.factors).reduce((s, f) => s + f.sum, 0);
      expect(result.raw).toBe(total);
    });

    test('反向计分应正确', () => {
      // 索引 4 → 分值 5
      const answers = questions.map(() => 4);
      const result = pf16.computeResult(answers, questions);
      // 全选 5 时，非反向 val=5, 反向 val=1
      // 每因素 3 题，至少 1 题反向
      const factorA = result.factors.A;
      const aQs = questions.filter((q) => q.dimension === 'A');
      const expectedSum = aQs.reduce((s, q) => s + (q.reverse ? 1 : 5), 0);
      expect(factorA.sum).toBe(expectedSum);
    });
  });

  describe('模块方法', () => {
    test('buildInterpretations 应返回解读数组', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = pf16.computeResult(answers, questions);
      const scaleDimList = Object.entries(result.dimensions).map(([k, f]) => ({
        key: k, name: f.name, percent: f.percent, level: f.level, text: f.text, sum: f.sum,
      }));
      const interp = pf16.buildInterpretations(result, [], scaleDimList);
      expect(interp.length).toBeGreaterThan(0);
      expect(interp[0].title).toBe('总体画像');
    });

    test('getDimensionLabel 应返回中文因素名', () => {
      expect(pf16.getDimensionLabel('A')).toBe('乐群性');
      expect(pf16.getDimensionLabel('Q1')).toBe('实验性');
      expect(pf16.getDimensionLabel('Q4')).toBe('紧张性');
    });
  });
});
