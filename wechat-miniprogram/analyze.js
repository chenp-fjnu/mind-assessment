const { getModule, getMetaList } = require('./utils/registry');
const { getResultView } = require('./utils/result-view');

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

const metaList = getMetaList();
console.log('Total modules:', metaList.length);

// Build comprehensive mapping
const mapping = {};

metaList.forEach((meta) => {
  const mod = getModule(meta.id);
  if (!mod) {
    console.log('Module not found:', meta.id);
    return;
  }
  
  const questions = mod.getQuestions();
  const answers = questions.map(pickAnswer);
  const r = mod.computeResult(answers, questions);
  const layout = mod.resultLayout || {};
  const view = getResultView(mod, r, layout);
  
  const itemData = {
    moduleId: meta.id,
    moduleName: meta.name,
    type: meta.type,
    questionCount: questions.length,
    // Extract evaluation items from the result view
    groups: view.groups,
    dims: view.dims,
    subtests: view.subtests,
    interpretations: view.interpretations,
    showBipolar: view.showBipolar,
    // Raw result keys
    resultKeys: Object.keys(r).filter(k => ['iq', 'score', 'index', 'trait', 'type', 'level', 'percent', 'summary'].includes(k)),
  };
  
  mapping[meta.id] = itemData;
});

// Output summary
console.log('Total modules:', metaList.length);

// Show modules with their evaluation item structure
console.log('\nModule evaluation item structure:');
Object.entries(mapping).forEach(([id, data]) => {
  console.log(`\n${data.moduleName} (${data.moduleId}):`);
  console.log(`  问题数: ${data.questionCount}`);
  console.log(`  结果字段: ${data.resultKeys.join(', ')}`);
  console.log(`  groups: ${JSON.stringify(data.groups).substring(0, 80)}`);
  console.log(`  dims: ${data.dims ? data.dims.length + ' dimensions' : 'none'}`);
  console.log(`  subtests: ${data.subtests ? data.subtests.length + ' subtests' : 'none'}`);
  console.log(`  interpretations: ${data.interpretations ? data.interpretations.length + ' interpretations' : 'none'}`);
  console.log(`  showBipolar: ${data.showBipolar}`);
});

console.log('\n--- Done ---');