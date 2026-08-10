/**
 * SPM 瑞文标准推理测验 - 评分逻辑测试
 */
const spm = require('../../shared/modules/spm');
const scoring = require('../../shared/utils/scoring');

describe('SPM 评分模块', () => {
  const questions = spm.getQuestions();

  test('应有 60 道题', () => {
    expect(questions).toHaveLength(60);
  });

  test('每道题应包含 id, set, matrix, options, answer', () => {
    questions.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.set).toBeDefined();
      expect(q.matrix).toBeDefined();
      expect(q.options).toBeDefined();
      expect(q.answer).toBeDefined();
    });
  });

  test('题目应分为 A-E 五组各 12 题', () => {
    const groups = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    questions.forEach((q) => groups[q.set]++);
    ['A', 'B', 'C', 'D', 'E'].forEach((g) => {
      expect(groups[g]).toBe(12);
    });
  });

  describe('评分逻辑', () => {
    test('全部正确 → IQ 应在优秀范围 (≥120)', () => {
      const answers = questions.map((q) => q.answer);
      const result = spm.computeResult(answers, questions, questions.map(() => 10));
      expect(result.raw).toBe(60);
      expect(result.iq).toBeGreaterThanOrEqual(120);
      expect(result.percentile).toBe(99);
      expect(result.groups.A).toBe(12);
      expect(result.groups.E).toBe(12);
    });

    test('全部错误 → raw=0, IQ 应较低', () => {
      const wrongAnswers = questions.map((q) => (q.answer + 1) % q.options.length);
      const result = spm.computeResult(wrongAnswers, questions);
      expect(result.raw).toBe(0);
      expect(result.iq).toBeLessThan(80);
    });

    test('全部跳过 → raw=0, skipped=60', () => {
      const answers = questions.map(() => null);
      const result = spm.computeResult(answers, questions);
      expect(result.raw).toBe(0);
      expect(result.totalStat.skipped).toBe(60);
      expect(result.totalStat.correct).toBe(0);
    });

    test('半数正确 → raw=30, IQ 应在中等范围', () => {
      const answers = questions.map((q, i) => (i < 30 ? q.answer : (q.answer + 1) % q.options.length));
      const result = spm.computeResult(answers, questions);
      expect(result.raw).toBe(30);
      expect(result.iq).toBeGreaterThanOrEqual(70);
      expect(result.iq).toBeLessThanOrEqual(130);
    });

    test('分组得分应正确统计', () => {
      const answers = questions.map((q) => {
        if (q.set === 'A') return q.answer;
        return (q.answer + 1) % q.options.length;
      });
      const result = spm.computeResult(answers, questions);
      expect(result.groups.A).toBe(12);
      expect(result.groups.B).toBe(0);
    });

    test(' totalTime 应为 timings 之和', () => {
      const timings = questions.map((_, i) => (i + 1) * 2);
      const answers = questions.map((q) => q.answer);
      const result = spm.computeResult(answers, questions, timings);
      const expectedTotal = timings.reduce((a, b) => a + b, 0);
      expect(result.totalTime).toBe(expectedTotal);
    });

    test('level 应与 IQ 区间匹配', () => {
      const answers = questions.map((q) => q.answer);
      const result = spm.computeResult(answers, questions);
      expect(result.level).toBeDefined();
      if (result.iq >= 130) expect(result.level).toBe('极优');
      else if (result.iq >= 120) expect(result.level).toBe('优秀');
      else if (result.iq >= 110) expect(result.level).toBe('中上');
      else if (result.iq >= 90) expect(result.level).toBe('中等');
    });
  });

  describe('常模表', () => {
    test('百分位应随分数递增', () => {
      const p20 = scoring.RAW_TO_PERCENTILE[20];
      const p40 = scoring.RAW_TO_PERCENTILE[40];
      const p60 = scoring.RAW_TO_PERCENTILE[60];
      expect(p20).toBeLessThan(p40);
      expect(p40).toBeLessThan(p60);
    });

    test('percentileToIQ(50) 应接近 100', () => {
      const iq = scoring.percentileToIQ(50);
      expect(iq).toBeGreaterThanOrEqual(95);
      expect(iq).toBeLessThanOrEqual(105);
    });

    // P2-14: 低分常模补充测试
    test('低分常模应覆盖 0-19 分', () => {
      for (let i = 0; i <= 19; i++) {
        expect(scoring.RAW_TO_PERCENTILE[i]).toBeDefined();
        expect(scoring.RAW_TO_PERCENTILE[i]).toBeGreaterThan(0);
        expect(scoring.RAW_TO_PERCENTILE[i]).toBeLessThan(2);
      }
    });

    test('低分百分位应随分数递增', () => {
      const p5 = scoring.RAW_TO_PERCENTILE[5];
      const p10 = scoring.RAW_TO_PERCENTILE[10];
      const p15 = scoring.RAW_TO_PERCENTILE[15];
      const p19 = scoring.RAW_TO_PERCENTILE[19];
      expect(p5).toBeLessThanOrEqual(p10);
      expect(p10).toBeLessThanOrEqual(p15);
      expect(p15).toBeLessThan(p19);
    });

    test('常模表应覆盖 0-60 全范围', () => {
      for (let i = 0; i <= 60; i++) {
        expect(scoring.RAW_TO_PERCENTILE[i]).toBeDefined();
      }
    });
  });

  describe('模块方法', () => {
    test('buildGroupList 应返回 5 组', () => {
      const answers = questions.map((q) => q.answer);
      const result = spm.computeResult(answers, questions);
      const groupList = spm.buildGroupList(result, spm.resultLayout);
      expect(groupList).toHaveLength(5);
      groupList.forEach((g) => {
        expect(g).toHaveProperty('key');
        expect(g).toHaveProperty('label');
        expect(g).toHaveProperty('percent');
        expect(g).toHaveProperty('display');
      });
    });

    test('buildInterpretations 应返回解读数组', () => {
      const answers = questions.map((q) => q.answer);
      const result = spm.computeResult(answers, questions);
      const groupList = spm.buildGroupList(result, spm.resultLayout);
      const interpretations = spm.buildInterpretations(result, groupList);
      expect(interpretations.length).toBeGreaterThan(0);
      interpretations.forEach((item) => {
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('text');
      });
    });

    test('getDimensionLabel 应返回维度标签', () => {
      expect(spm.getDimensionLabel('A')).toBe('A');
      expect(spm.getDimensionLabel('E')).toBe('E');
    });
  });
});
