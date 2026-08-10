/**
 * module-system 模块注册表 - 单元测试
 */
const modules = require('../../shared/modules/module-system');

describe('module-system 模块注册表', () => {
  describe('getModule', () => {
    test('应能按 id 查找已知模块', () => {
      const spm = modules.getModule('spm');
      expect(spm).toBeDefined();
      expect(spm.id).toBe('spm');
      expect(spm.name).toBe('瑞文标准推理测验');
    });

    test('查找不存在的 id 应返回 undefined', () => {
      expect(modules.getModule('nonexistent')).toBeUndefined();
    });

    test('应能查找所有 14 个模块', () => {
      ['spm', 'mbti', 'wechsler', 'big5', 'pf16', 'epq', 'disc',
       'sds', 'sas', 'gad7', 'dass21', 'holland', 'ses', 'las'].forEach((id) => {
        expect(modules.getModule(id)).toBeDefined();
      });
    });
  });

  describe('listByType', () => {
    test('应能筛选 intelligence 类型', () => {
      const intel = modules.listByType('intelligence');
      expect(intel.length).toBe(2); // spm + wechsler
      expect(intel.map((m) => m.id).sort()).toEqual(['spm', 'wechsler']);
    });

    test('应能筛选 personality 类型', () => {
      const pers = modules.listByType('personality');
      expect(pers.length).toBe(4); // mbti + big5 + pf16 + epq
    });

    test('应能筛选 mood 类型', () => {
      const mood = modules.listByType('mood');
      expect(mood.length).toBe(4); // sds + sas + gad7 + dass21
      expect(mood[0].id).toBe('sds');
    });

    test('应能筛选 career 类型', () => {
      const career = modules.listByType('career');
      expect(career.length).toBe(2); // disc + holland
    });

    test('应能筛选 self 类型', () => {
      const self = modules.listByType('self');
      expect(self.length).toBe(2); // ses + las
    });

    test('不存在的类型应返回空数组', () => {
      expect(modules.listByType('nonexistent')).toEqual([]);
    });
  });

  describe('listAll', () => {
    test('应返回所有 14 个模块', () => {
      const all = modules.listAll();
      expect(all).toHaveLength(14);
    });

    test('返回的数组应为副本（修改不影响原注册表）', () => {
      const all = modules.listAll();
      all.push({ id: 'fake' });
      expect(modules.listAll()).toHaveLength(14);
    });
  });

  describe('listGrouped', () => {
    test('应按类型分组返回', () => {
      const grouped = modules.listGrouped();
      expect(grouped.intelligence).toBeDefined();
      expect(grouped.personality).toBeDefined();
      expect(grouped.mood).toBeDefined();
      expect(grouped.career).toBeDefined();
      expect(grouped.self).toBeDefined();
    });

    test('各组数量应正确', () => {
      const grouped = modules.listGrouped();
      expect(grouped.intelligence).toHaveLength(2);
      expect(grouped.personality).toHaveLength(4);
      expect(grouped.mood).toHaveLength(4);
      expect(grouped.career).toHaveLength(2);
      expect(grouped.self).toHaveLength(2);
    });
  });

  describe('getCard', () => {
    test('应返回模块的展示卡片信息', () => {
      const card = modules.getCard('spm');
      expect(card).toBeDefined();
      expect(card.id).toBe('spm');
      expect(card.name).toBe('瑞文标准推理测验');
      expect(card.icon).toBe('🧩');
      expect(card.color).toBe('#1e3a8a');
      expect(card.paid).toBe(true);
      expect(card.price).toBe(9.9);
    });

    test('未知模块应返回 null', () => {
      expect(modules.getCard('nonexistent')).toBeNull();
    });

    test('卡片应包含所有展示字段', () => {
      const card = modules.getCard('mbti');
      ['id', 'type', 'name', 'shortName', 'desc', 'icon', 'color',
       'duration', 'questionCount', 'paid', 'price', 'tag'].forEach((field) => {
        expect(card).toHaveProperty(field);
      });
    });

    test('卡片不应包含方法（不应泄漏内部方法）', () => {
      const card = modules.getCard('spm');
      expect(card.getQuestions).toBeUndefined();
      expect(card.computeResult).toBeUndefined();
    });
  });
});
