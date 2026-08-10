/**
 * format 格式化工具 - 单元测试
 */
const { formatScore, formatLevel } = require('../../shared/utils/format');

describe('format 格式化工具', () => {
  describe('formatScore', () => {
    test('SPM 记录应返回 IQ 值', () => {
      const record = { testId: 'spm', iq: 115, raw: 45 };
      expect(formatScore(record)).toBe('115');
    });

    test('MBTI 记录应返回 type 值', () => {
      const record = { testId: 'mbti', type: 'INTJ', raw: 28 };
      expect(formatScore(record)).toBe('INTJ');
    });

    test('Wechsler 记录应返回 FSIQ 值', () => {
      const record = { testId: 'wechsler', fsiq: 105, raw: 20 };
      expect(formatScore(record)).toBe('105');
    });

    test('Big5 记录应返回 trait 前 3 段', () => {
      const record = {
        testId: 'big5',
        trait: 'O80% C60% E50% A40% N30%',
        raw: 75,
      };
      const result = formatScore(record);
      // trait 字段取前 3 段（按空格分割）
      expect(result).toBe('O80% C60% E50%');
    });

    test('16PF 记录应返回 trait 前 3 段', () => {
      const record = {
        testId: 'pf16',
        trait: 'A80 B60 C50 E40 F30 G20 H10 I50 L60 M70 N40 O30 Q110 Q230 Q340 Q450',
        raw: 120,
      };
      const result = formatScore(record);
      expect(result.split(' ').length).toBe(3);
    });

    test('SDS 记录应返回 index 值', () => {
      const record = { testId: 'sds', index: 53, raw: 42 };
      expect(formatScore(record)).toBe('53');
    });

    test('未知模块应回退到 raw', () => {
      const record = { testId: 'unknown', raw: 42 };
      expect(formatScore(record)).toBe('42');
    });

    test('缺少 primaryField 值应回退到 raw', () => {
      const record = { testId: 'spm', raw: 30 };
      expect(formatScore(record)).toBe('30');
    });
  });

  describe('formatLevel', () => {
    test('MBTI 应返回 typeName', () => {
      const record = { testId: 'mbti', typeName: '建筑师', level: 'INTJ' };
      expect(formatLevel(record)).toBe('建筑师');
    });

    test('非 MBTI 应返回 level', () => {
      const record = { testId: 'spm', level: '中等' };
      expect(formatLevel(record)).toBe('中等');
    });

    test('SDS 应返回 level', () => {
      const record = { testId: 'sds', level: '轻度抑郁' };
      expect(formatLevel(record)).toBe('轻度抑郁');
    });

    test('MBTI 无 typeName 应返回空字符串', () => {
      const record = { testId: 'mbti' };
      expect(formatLevel(record)).toBe('');
    });

    test('无 level 应返回空字符串', () => {
      const record = { testId: 'spm' };
      expect(formatLevel(record)).toBe('');
    });
  });
});
