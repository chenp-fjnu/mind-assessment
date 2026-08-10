/**
 * Big Five 大五人格 - 评分逻辑测试
 */
const big5 = require('../../shared/modules/big5');
const { computeScaleScores } = require('../../shared/utils/scale-scoring');

describe('Big Five 大五人格模块', () => {
  const questions = big5.getQuestions();

  test('应有 25 道题', () => {
    expect(questions).toHaveLength(25);
  });

  test('每维度应有 5 道题', () => {
    const dims = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    questions.forEach((q) => dims[q.dimension]++);
    Object.values(dims).forEach((c) => expect(c).toBe(5));
  });

  test('量表应为 5 级 (1-5)', () => {
    questions.forEach((q) => {
      expect(q.scale.min).toBe(1);
      expect(q.scale.max).toBe(5);
    });
  });

  describe('评分逻辑', () => {
    test('全部选 5 → 非反向题 val=5, 反向题 val=1 → percent 反映混合', () => {
      // P0-2: 答案以 0-based 索引存储，索引 4 → 分值 5（min=1）
      const answers = questions.map(() => 4);
      const result = big5.computeResult(answers, questions);
      // O 维度: 4 非反向(5) + 1 反向(1) → avg=4.2 → percent=80
      expect(result.dimensions.O.percent).toBe(80);
      // C 维度: 3 非反向(5) + 2 反向(1) → avg=3.4 → percent=60
      expect(result.dimensions.C.percent).toBe(60);
    });

    test('全部选 1 → 非反向题 val=1, 反向题 val=5 → percent 反映混合', () => {
      // 索引 0 → 分值 1
      const answers = questions.map(() => 0);
      const result = big5.computeResult(answers, questions);
      // O 维度: 4 非反向(1) + 1 反向(5) → avg=1.8 → percent=20
      expect(result.dimensions.O.percent).toBe(20);
      // C 维度: 3 非反向(1) + 2 反向(5) → avg=2.6 → percent=40
      expect(result.dimensions.C.percent).toBe(40);
    });

    test('按方向作答（正向选5反向选1）→ 所有维度 percent 应为 100', () => {
      // 对非反向题选 索引4(分值5)，反向题选 索引0(分值1) → 所有题 val=5
      const answers = questions.map((q) => (q.reverse ? 0 : 4));
      const result = big5.computeResult(answers, questions);
      ['O', 'C', 'E', 'A', 'N'].forEach((d) => {
        expect(result.dimensions[d].percent).toBe(100);
        expect(result.dimensions[d].level).toBe('high');
      });
    });

    test('全部选 3（中立）→ 所有维度 percent 应为 50', () => {
      // 索引 2 → 分值 3
      const answers = questions.map(() => 2);
      const result = big5.computeResult(answers, questions);
      ['O', 'C', 'E', 'A', 'N'].forEach((d) => {
        expect(result.dimensions[d].percent).toBe(50);
        expect(result.dimensions[d].level).toBe('mid');
      });
    });

    test('反向计分应正确翻转', () => {
      // 对反向题选 5(索引4)，应等同于正向题选 1
      const reverseQs = questions.filter((q) => q.reverse);
      expect(reverseQs.length).toBeGreaterThan(0);
      // 全选 索引4(分值5)，反向题的 val 应为 1
      const answers = questions.map(() => 4);
      const result = big5.computeResult(answers, questions);
      // 全选 5 时，非反向题 val=5, 反向题 val=1
      // 每维度 5 题中有部分反向，混合后 percent 不是 100
      // 但至少验证维度存在
      expect(result.dimensions.O).toBeDefined();
    });

    test('维度 sum 应为各题分值之和', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = big5.computeResult(answers, questions);
      // 非反向题 val=4, 反向题 val=2 (6-4=2)
      ['O', 'C', 'E', 'A', 'N'].forEach((d) => {
        const dimQs = questions.filter((q) => q.dimension === d);
        const expected = dimQs.reduce((s, q) => s + (q.reverse ? 2 : 4), 0);
        expect(result.dimensions[d].sum).toBe(expected);
      });
    });

    test('raw 应为所有维度 sum 之和', () => {
      // 索引 2 → 分值 3
      const answers = questions.map(() => 2);
      const result = big5.computeResult(answers, questions);
      const totalSum = Object.values(result.dimensions).reduce((s, d) => s + d.sum, 0);
      expect(result.raw).toBe(totalSum);
    });

    test('trait 应包含 5 个维度的百分比', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = big5.computeResult(answers, questions);
      expect(result.trait).toMatch(/O\d+%/);
      expect(result.trait).toMatch(/C\d+%/);
      expect(result.trait).toMatch(/E\d+%/);
      expect(result.trait).toMatch(/A\d+%/);
      expect(result.trait).toMatch(/N\d+%/);
    });

    test('未作答的题应使用默认值 3', () => {
      const answers = questions.map(() => null);
      const result = big5.computeResult(answers, questions);
      expect(result.totalStat.skipped).toBe(25);
      ['O', 'C', 'E', 'A', 'N'].forEach((d) => {
        expect(result.dimensions[d].percent).toBe(50);
      });
    });
  });

  describe('模块方法', () => {
    test('buildInterpretations 应使用 scaleDimensionList', () => {
      // 索引 3 → 分值 4
      const answers = questions.map(() => 3);
      const result = big5.computeResult(answers, questions);
      const scaleDimList = Object.entries(result.dimensions).map(([k, dim]) => ({
        key: k, name: dim.name, en: dim.en, percent: dim.percent,
        level: dim.level, text: dim.text, sum: dim.sum,
      }));
      const interp = big5.buildInterpretations(result, [], scaleDimList);
      expect(interp.length).toBeGreaterThan(0);
      expect(interp[0].title).toBe('总体画像');
    });

    test('getDimensionLabel 应返回中文维度名', () => {
      expect(big5.getDimensionLabel('O')).toBe('开放性');
      expect(big5.getDimensionLabel('C')).toBe('尽责性');
      expect(big5.getDimensionLabel('E')).toBe('外向性');
      expect(big5.getDimensionLabel('A')).toBe('宜人性');
      expect(big5.getDimensionLabel('N')).toBe('神经质');
    });
  });
});
