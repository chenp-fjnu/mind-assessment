/**
 * 游戏页面定时器清理 Mixin
 *
 * 统一为所有游戏页面注入 onHide / onUnload 生命周期方法，
 * 自动清理 this.timer（setTimeout）和 this.intervalId（setInterval），
 * 防止页面隐藏后定时器继续运行导致的内存泄漏和数据错乱。
 *
 * 用法：
 *   const { withGameTimer } = require('../../../utils/game-mixin');
 *   Page(withGameTimer({
 *     // ...你的页面配置
 *     timer: null,
 *     onStop() { /* ... *\/ },
 *   }));
 *
 * 如果页面已有 onHide / onUnload，会在清理定时器后调用原始方法。
 */
function withGameTimer(pageConfig) {
  const origOnHide = pageConfig.onHide;
  const origOnUnload = pageConfig.onUnload;
  const origOnShow = pageConfig.onShow;

  pageConfig.onHide = function () {
    _clearTimers(this);
    if (origOnHide) origOnHide.call(this);
  };

  // P1-2: 切后台返回后恢复游戏状态
  // 如果页面已定义 onShow，优先调用；否则调用可选的 onGameResume 钩子
  pageConfig.onShow = function () {
    if (origOnShow) {
      origOnShow.call(this);
    } else if (typeof this.onGameResume === 'function') {
      this.onGameResume();
    }
  };

  pageConfig.onUnload = function () {
    _clearTimers(this);
    if (origOnUnload) origOnUnload.call(this);
  };

  return pageConfig;
}

function _clearTimers(page) {
  // 清理 this.timer（可能是 setTimeout 或 setInterval 的返回值）
  // clearTimeout 和 clearInterval 在微信小程序中可互换，但为安全起见两者都调用
  if (page.timer) {
    clearTimeout(page.timer);
    clearInterval(page.timer);
    page.timer = null;
  }
  // 清理 setInterval（部分游戏使用 intervalId）
  if (page.intervalId) {
    clearInterval(page.intervalId);
    clearTimeout(page.intervalId);
    page.intervalId = null;
  }
}

module.exports = { withGameTimer };
