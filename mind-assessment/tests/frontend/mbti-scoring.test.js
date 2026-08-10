/**
 * MBTI 人格测试 - 评分逻辑测试
 */
const mbti = require('../../shared/modules/mbti');

describe('MBTI 评分模块', () => {
  const questions = mbti.getQuestions();

  test('应有 28 道题', () => {
    expect(questions).toHaveLength(28);
  });

  test('每维度应有 7 道题', () => {
    const dimCounts = { EI: 0, SN: 0, TF: 0, JP: 0 };
    questions.forEach((q) => dimCounts[q.dimension]++);
    Object.values(dimCounts).forEach((c) => expect(c).toBe(7));
  });

  test('每题应有两个选项', () => {
    questions.forEach((q) => {
      expect(q.options).toHaveLength(2);
    });
  });

  describe('评分逻辑', () => {
    test('全选 A（选项0）→ 应根据 pole 计算', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      expect(result.type).toBeDefined();
      expect(result.type).toHaveLength(4);
      // 所有题选 0 → 每个 pole +1
      // pole 为 E 的题选 0 → E+1, pole 为 I 的题选 0 → E+1 (因为 opposite)
    });

    test('全选 B（选项1）→ 应计算对立极', () => {
      const answers = questions.map(() => 1);
      const result = mbti.computeResult(answers, questions);
      expect(result.type).toHaveLength(4);
    });

    test('维度百分比之和应为 100', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      ['EI', 'SN', 'TF', 'JP'].forEach((d) => {
        const dim = result.dimensions[d];
        expect(dim.leftPercent + dim.rightPercent).toBeCloseTo(100, 0);
      });
    });

    test('dominant 应与百分比一致', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      ['EI', 'SN', 'TF', 'JP'].forEach((d) => {
        const dim = result.dimensions[d];
        if (dim.leftPercent > dim.rightPercent) {
          expect(dim.dominant).toBe(dim.info.left);
        } else {
          expect(dim.dominant).toBe(dim.info.right);
        }
      });
    });

    test('type 应由 4 个 dominant 字母组成', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      expect(result.type).toMatch(/^[EISTNJFP]{4}$/);
    });

    test('typeName 应在 16 型描述表中找到', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      expect(result.typeName).toBeDefined();
      expect(result.typeName).not.toBe('未知');
    });

    test('counts 总和应等于已答题数', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      const sum = Object.values(result.counts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(28);
    });

    test('跳过的题不应计入 counts', () => {
      const answers = questions.map((_, i) => (i < 14 ? 0 : null));
      const result = mbti.computeResult(answers, questions);
      const sum = Object.values(result.counts).reduce((a, b) => a + b, 0);
      expect(sum).toBe(14);
      expect(result.totalStat.skipped).toBe(14);
    });
  });

  describe('16 型覆盖测试', () => {
    // 构造特定答案以测试不同类型
    test('E型主导 → type 首字母为 E', () => {
      // EI 维度所有题选 pole 对应的选项
      const answers = questions.map((q) => {
        if (q.dimension === 'EI') return q.pole === 'E' ? 0 : 1; // 都给 E
        return 0;
      });
      const result = mbti.computeResult(answers, questions);
      expect(result.type[0]).toBe('E');
    });

    test('I型主导 → type 首字母为 I', () => {
      const answers = questions.map((q) => {
        if (q.dimension === 'EI') return q.pole === 'I' ? 0 : 1; // 都给 I
        return 0;
      });
      const result = mbti.computeResult(answers, questions);
      expect(result.type[0]).toBe('I');
    });
  });

  describe('模块方法', () => {
    test('buildInterpretations 应返回 4 条解读', () => {
      const answers = questions.map(() => 0);
      const result = mbti.computeResult(answers, questions);
      const interp = mbti.buildInterpretations(result);
      expect(interp).toHaveLength(4);
      expect(interp[0].title).toBe('人格类型');
    });

    test('getDimensionLabel 应返回中文标签', () => {
      expect(mbti.getDimensionLabel('EI')).toBe('外向/内向');
      expect(mbti.getDimensionLabel('SN')).toBe('实感/直觉');
      expect(mbti.getDimensionLabel('TF')).toBe('思考/情感');
      expect(mbti.getDimensionLabel('JP')).toBe('判断/感知');
    });
  });
});
