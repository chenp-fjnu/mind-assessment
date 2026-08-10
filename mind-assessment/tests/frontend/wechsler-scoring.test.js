/**
 * 韦氏智力测验 - 评分逻辑测试
 */
const wechsler = require('../../shared/modules/wechsler');

describe('韦氏智力测验模块', () => {
  const questions = wechsler.getQuestions();

  test('应有 30 道题', () => {
    expect(questions).toHaveLength(30);
  });

  test('应有 6 个分测验各 5 题', () => {
    const subtests = {};
    questions.forEach((q) => {
      subtests[q.subtest] = (subtests[q.subtest] || 0) + 1;
    });
    expect(Object.keys(subtests)).toHaveLength(6);
    Object.values(subtests).forEach((c) => expect(c).toBe(5));
  });

  test('分测验应分属 verbal 和 performance 两类', () => {
    const domains = new Set(questions.map((q) => q.domain));
    expect(domains.has('verbal')).toBe(true);
    expect(domains.has('performance')).toBe(true);
  });

  test('言语类应有 15 题（3 个分测验 × 5）', () => {
    const verbal = questions.filter((q) => q.domain === 'verbal');
    expect(verbal).toHaveLength(15);
  });

  test('操作类应有 15 题', () => {
    const perf = questions.filter((q) => q.domain === 'performance');
    expect(perf).toHaveLength(15);
  });

  describe('评分逻辑', () => {
    test('全部正确 → FSIQ 应较高', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions, questions.map(() => 10));
      expect(result.raw).toBe(30);
      expect(result.fsiq).toBeGreaterThanOrEqual(100);
      expect(result.viq).toBeGreaterThanOrEqual(100);
      expect(result.piq).toBeGreaterThanOrEqual(100);
    });

    test('全部错误 → raw=0, FSIQ 应较低', () => {
      const wrong = questions.map((q) => (q.answer + 1) % q.options.length);
      const result = wechsler.computeResult(wrong, questions);
      expect(result.raw).toBe(0);
      expect(result.fsiq).toBeLessThanOrEqual(70);
    });

    test('VIQ 和 PIQ 应分别反映言语和操作得分', () => {
      // 言语全对、操作全错
      const answers = questions.map((q) => {
        if (q.domain === 'verbal') return q.answer;
        return (q.answer + 1) % q.options.length;
      });
      const result = wechsler.computeResult(answers, questions);
      expect(result.viq).toBeGreaterThan(result.piq);
      expect(result.groups.言语).toBe(15);
      expect(result.groups.操作).toBe(0);
    });

    test('量表分范围应在 4-19', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions);
      Object.values(result.scaleScores).forEach((s) => {
        expect(s).toBeGreaterThanOrEqual(4);
        expect(s).toBeLessThanOrEqual(19);
      });
    });

    test('FSIQ 应为 VIQ 和 PIQ 的平均值', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions);
      expect(result.fsiq).toBe(Math.round((result.viq + result.piq) / 2));
    });

    test('level 应与 FSIQ 匹配', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions);
      if (result.fsiq >= 130) expect(result.level).toBe('极优');
      else if (result.fsiq >= 120) expect(result.level).toBe('优秀');
      else if (result.fsiq >= 110) expect(result.level).toBe('中上');
      else if (result.fsiq >= 90) expect(result.level).toBe('中等');
    });

    test('totalStat 应正确统计', () => {
      const answers = questions.map((q, i) => (i < 20 ? q.answer : null));
      const result = wechsler.computeResult(answers, questions);
      expect(result.totalStat.correct).toBe(20);
      expect(result.totalStat.skipped).toBe(10);
    });
  });

  describe('模块方法', () => {
    test('buildGroupList 应返回言语和操作两组', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions);
      const groups = wechsler.buildGroupList(result, wechsler.resultLayout);
      expect(groups).toHaveLength(2);
      const labels = groups.map((g) => g.label);
      expect(labels).toContain('言语理解');
      expect(labels).toContain('操作推理');
    });

    test('buildInterpretations 应返回解读数组', () => {
      const answers = questions.map((q) => q.answer);
      const result = wechsler.computeResult(answers, questions);
      const interp = wechsler.buildInterpretations(result);
      expect(interp.length).toBeGreaterThan(0);
      expect(interp[0].title).toBe('总体水平');
    });
  });
});
