/**
 * validate 输入校验工具 - 单元测试
 */
const validate = require('../../../server/utils/validate');

describe('validate 输入校验工具', () => {
  describe('isOpenid', () => {
    test('合法 openid 应返回 true', () => {
      expect(validate.isOpenid('o1234567890abcdef')).toBe(true);
    });

    test('空字符串应返回 false', () => {
      expect(validate.isOpenid('')).toBe(false);
    });

    test('null 应返回 false', () => {
      expect(validate.isOpenid(null)).toBe(false);
    });

    test('超长字符串(>=64)应返回 false', () => {
      expect(validate.isOpenid('a'.repeat(64))).toBe(false);
    });

    test('非字符串应返回 false', () => {
      expect(validate.isOpenid(123)).toBe(false);
      expect(validate.isOpenid({})).toBe(false);
    });
  });

  describe('isModuleId', () => {
    test('合法 moduleId 应返回 true', () => {
      expect(validate.isModuleId('spm')).toBe(true);
      expect(validate.isModuleId('big5')).toBe(true);
      expect(validate.isModuleId('pf16')).toBe(true);
    });

    test('含大写字母应返回 false', () => {
      expect(validate.isModuleId('SPM')).toBe(false);
    });

    test('含特殊字符应返回 false', () => {
      expect(validate.isModuleId('spm-test')).toBe(false);
      expect(validate.isModuleId('spm_test')).toBe(false);
      expect(validate.isModuleId('spm!')).toBe(false);
    });

    test('空字符串应返回 false', () => {
      expect(validate.isModuleId('')).toBe(false);
    });

    test('超长 moduleId(>20)应返回 false', () => {
      expect(validate.isModuleId('a'.repeat(21))).toBe(false);
    });
  });

  describe('isRecordId', () => {
    test('合法 recordId 应返回 true', () => {
      expect(validate.isRecordId('R1234567890')).toBe(true);
      expect(validate.isRecordId('R1')).toBe(true);
    });

    test('不以 R 开头应返回 false', () => {
      expect(validate.isRecordId('123456')).toBe(false);
      expect(validate.isRecordId('r123456')).toBe(false);
    });

    test('R 后无数字应返回 false', () => {
      expect(validate.isRecordId('R')).toBe(false);
      expect(validate.isRecordId('RABC')).toBe(false);
    });

    test('空字符串应返回 false', () => {
      expect(validate.isRecordId('')).toBe(false);
    });
  });

  describe('isAmount', () => {
    test('合法金额应返回 true', () => {
      expect(validate.isAmount(990)).toBe(true);
      expect(validate.isAmount(1)).toBe(true);
      expect(validate.isAmount(100000)).toBe(true);
    });

    test('小于 1 应返回 false', () => {
      expect(validate.isAmount(0)).toBe(false);
      expect(validate.isAmount(-1)).toBe(false);
    });

    test('大于 100000 应返回 false', () => {
      expect(validate.isAmount(100001)).toBe(false);
    });

    test('非数值类型应返回 false', () => {
      expect(validate.isAmount('990')).toBe(false);
      expect(validate.isAmount(null)).toBe(false);
      expect(validate.isAmount(undefined)).toBe(false);
    });
  });

  // P2-2: maskOpenid 日志脱敏测试
  describe('maskOpenid', () => {
    test('长 openid 应保留前4后4', () => {
      const masked = validate.maskOpenid('o1234567890abcdef');
      expect(masked).toBe('o123****cdef');
      expect(masked).not.toContain('4567890ab');
    });

    test('短 openid(<=8) 应只保留前2位', () => {
      const masked = validate.maskOpenid('o1234');
      expect(masked).toBe('o1****');
    });

    test('null 应返回 unknown', () => {
      expect(validate.maskOpenid(null)).toBe('unknown');
    });

    test('空字符串应返回 unknown', () => {
      expect(validate.maskOpenid('')).toBe('unknown');
    });

    test('非字符串应返回 unknown', () => {
      expect(validate.maskOpenid(123)).toBe('unknown');
      expect(validate.maskOpenid(undefined)).toBe('unknown');
    });
  });
});
