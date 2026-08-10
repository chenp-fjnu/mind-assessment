/**
 * scale-scoring 通用量表评分工具 - 单元测试
 * P0-2: 答案以 0-based 索引存储，computeScaleScores 内部通过 raw + min 转换为实际分值
 */
const { computeScaleScores } = require('../../shared/utils/scale-scoring');

describe('scale-scoring 通用量表评分工具', () => {
  const mockDimensions = {
    X: { name: '维度X', en: 'DimX', desc: '测试维度X', high: 'X偏高', low: 'X偏低' },
    Y: { name: '维度Y', en: 'DimY', desc: '测试维度Y', high: 'Y偏高', low: 'Y偏低' },
  };

  const mockQuestions = [
    { dimension: 'X', reverse: false },
    { dimension: 'X', reverse: false },
    { dimension: 'Y', reverse: false },
    { dimension: 'Y', reverse: true },
  ];

  describe('基本评分', () => {
    test('应正确计算维度 sum 和 avg', () => {
      // 索引 [4,3,2,1] → 分值 [5,4,3,2]（min=1）
      const answers = [4, 3, 2, 1];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      // X: 5+4=9, avg=4.5
      expect(result.X.sum).toBe(9);
      expect(result.X.avg).toBe(4.5);
      // Y: 3 + (6-2=4) = 7, avg=3.5
      expect(result.Y.sum).toBe(7);
      expect(result.Y.avg).toBe(3.5);
    });

    test('应正确计算百分比 (1-5 量表)', () => {
      // 索引 4 → 分值 5
      const answers = [4, 4, 4, 4];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      // X: avg=5, percent = (5-1)/(5-1)*100 = 100
      expect(result.X.percent).toBe(100);
      // Y: 非反向 val=5, 反向 val=1, avg=3, percent = (3-1)/4*100 = 50
      expect(result.Y.percent).toBe(50);
    });

    test('percent=100 → level=high', () => {
      // 索引 [4,4,0,0] → 分值 [5,5,1,1]
      const answers = [4, 4, 0, 0];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        highThreshold: 70, lowThreshold: 30,
      });
      expect(result.X.level).toBe('high');
    });

    test('percent=0 → level=low', () => {
      // 索引 [0,0,4,4] → 分值 [1,1,5,5]
      const answers = [0, 0, 4, 4];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        highThreshold: 70, lowThreshold: 30,
      });
      expect(result.X.percent).toBe(0);
      expect(result.X.level).toBe('low');
    });

    test('percent=50 → level=mid', () => {
      // 索引 2 → 分值 3
      const answers = [2, 2, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      expect(result.X.percent).toBe(50);
      expect(result.X.level).toBe('mid');
    });
  });

  describe('反向计分', () => {
    test('反向题应正确翻转分数', () => {
      // 索引 [2,2,2,4] → 分值 [3,3,3,5]
      const answers = [2, 2, 2, 4];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      // Y: 非反向题 val=3, 反向题 val=6-5=1
      // sum = 3+1 = 4, avg = 2
      expect(result.Y.sum).toBe(4);
      expect(result.Y.avg).toBe(2);
    });

    test('反向题选 1 应等价于正向题选 5', () => {
      const q = [{ dimension: 'X', reverse: true }];
      // 索引 0 → 分值 1, 反向后 val=5
      const result1 = computeScaleScores([0], q, mockDimensions);
      // 索引 4 → 分值 5, 正向 val=5
      const result5 = computeScaleScores([4], [{ dimension: 'X', reverse: false }], mockDimensions);
      expect(result1.X.sum).toBe(result5.X.sum); // 都是 5
    });
  });

  describe('空值处理', () => {
    test('未作答(null)应使用默认值', () => {
      const answers = [null, null, null, null];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        defaultVal: 3,
      });
      // 全部使用默认值 3
      expect(result.X.sum).toBe(6);
      expect(result.Y.sum).toBe(6); // 反向题 3→3
    });

    test('undefined 也应使用默认值', () => {
      const answers = [undefined, undefined, undefined, undefined];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        defaultVal: 3,
      });
      expect(result.X.sum).toBe(6);
    });
  });

  describe('自定义阈值', () => {
    test('应支持自定义 highThreshold', () => {
      // 索引 [3,3,2,2] → 分值 [4,4,3,3]
      const answers = [3, 3, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        highThreshold: 60, lowThreshold: 40,
      });
      // X: avg=4, percent=75 > 60 → high
      expect(result.X.level).toBe('high');
    });

    test('应支持自定义 lowThreshold', () => {
      // 索引 [1,1,2,2] → 分值 [2,2,3,3]
      const answers = [1, 1, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions, {
        highThreshold: 70, lowThreshold: 40,
      });
      // X: avg=2, percent=25 < 40 → low
      expect(result.X.level).toBe('low');
    });

    test('应支持自定义 min/max', () => {
      const q = [{ dimension: 'X', reverse: false }];
      // 索引 6 → 分值 7（min=1, max=7）
      const result = computeScaleScores([6], q, mockDimensions, {
        min: 1, max: 7, highThreshold: 70, lowThreshold: 30,
      });
      // avg=7, percent = (7-1)/(7-1)*100 = 100
      expect(result.X.percent).toBe(100);
    });
  });

  describe('text 字段', () => {
    test('high 级别应返回 high 描述', () => {
      // 索引 [4,4,2,2] → 分值 [5,5,3,3]
      const answers = [4, 4, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      expect(result.X.text).toBe('X偏高');
    });

    test('low 级别应返回 low 描述', () => {
      // 索引 [0,0,2,2] → 分值 [1,1,3,3]
      const answers = [0, 0, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      expect(result.X.text).toBe('X偏低');
    });

    test('mid 级别应返回中等描述', () => {
      // 索引 2 → 分值 3
      const answers = [2, 2, 2, 2];
      const result = computeScaleScores(answers, mockQuestions, mockDimensions);
      expect(result.X.text).toBe('处于中等水平。');
    });
  });
});
