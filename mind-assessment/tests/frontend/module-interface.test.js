/**
 * 模块接口合规性测试
 * 验证所有已注册模块都遵循统一接口规范
 */
const modules = require('../../shared/modules/module-system');

const REQUIRED_FIELDS = [
  'id', 'type', 'name', 'shortName', 'desc', 'icon', 'color',
  'duration', 'questionCount', 'paid', 'price', 'tag', 'questionType',
  'getQuestions', 'computeResult', 'resultLayout',
];

const VALID_TYPES = ['intelligence', 'personality', 'mood', 'career', 'self'];
const VALID_QUESTION_TYPES = ['matrix', 'choice', 'scale', 'number', 'sequence'];

describe('模块接口合规性', () => {
  const allModules = modules.listAll();

  test('注册表应包含 14 个模块', () => {
    expect(allModules).toHaveLength(14);
  });

  test('模块 ID 应唯一', () => {
    const ids = allModules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  allModules.forEach((mod) => {
    describe(`模块 ${mod.id}`, () => {
      REQUIRED_FIELDS.forEach((field) => {
        test(`应包含字段 "${field}"`, () => {
          expect(mod[field]).toBeDefined();
        });
      });

      test('type 应为合法值', () => {
        expect(VALID_TYPES).toContain(mod.type);
      });

      test('questionType 应为合法值', () => {
        expect(VALID_QUESTION_TYPES).toContain(mod.questionType);
      });

      test('id 应为小写字母数字', () => {
        expect(mod.id).toMatch(/^[a-z0-9]+$/);
      });

      test('color 应为合法 hex 颜色', () => {
        expect(mod.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      test('questionCount 应与 getQuestions() 返回数量一致', () => {
        const qs = mod.getQuestions();
        expect(qs).toHaveLength(mod.questionCount);
      });

      test('price 应为非负数', () => {
        expect(typeof mod.price).toBe('number');
        expect(mod.price).toBeGreaterThanOrEqual(0);
      });

      test('paid 为 true 时 price 应大于 0', () => {
        if (mod.paid) {
          expect(mod.price).toBeGreaterThan(0);
        }
      });

      test('resultLayout 应包含 primaryField', () => {
        expect(mod.resultLayout.primaryField).toBeDefined();
        expect(typeof mod.resultLayout.primaryField).toBe('string');
      });

      test('computeResult 应返回包含 resultLayout.primaryField 的对象', () => {
        const qs = mod.getQuestions();
        const answers = qs.map(() => 0);
        const result = mod.computeResult(answers, qs, qs.map(() => 5));
        expect(result).toBeDefined();
        expect(result).toHaveProperty(mod.resultLayout.primaryField);
      });
    });
  });
});
