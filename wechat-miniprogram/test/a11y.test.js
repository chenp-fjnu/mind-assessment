// 无障碍断言：所有可交互元素（bindtap/catchtap/role="button"）必须带 aria-label，
// 保证读屏软件可识别。新增带交互的 WXML 时，缺少 aria-label 将导致本测试失败。
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function walk(dir) {
  let result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) result = result.concat(walk(full));
    else if (entry.endsWith(".wxml")) result.push(full);
  }
  return result;
}

function findMissing(dir) {
  const missing = [];
  for (const file of walk(path.join(ROOT, dir))) {
    const text = fs.readFileSync(file, "utf8");
    const tags = text.match(/<[a-zA-Z][^>]*>/g) || [];
    for (const tag of tags) {
      const interactive =
        /bindtap|catchtap|bind:tap|catch:tap|role=["']button/.test(tag);
      if (interactive && !/aria-label=/.test(tag)) {
        missing.push(file.replace(ROOT + path.sep, "") + " :: " + tag.replace(/\n/g, " "));
      }
    }
  }
  return missing;
}

describe("无障碍：可交互元素均需 aria-label", () => {
  test("pages 下所有交互元素都有 aria-label", () => {
    const missing = findMissing("pages").concat(findMissing("components"));
    expect(missing).toEqual([]);
    if (missing.length) console.error("缺失 aria-label 的交互元素:\n" + missing.join("\n"));
  });
});
