# 纯本地模式 - 无后端

本项目为纯小程序版本，不依赖任何后端服务。

- 用户认证：使用 `wx.login` 获取 code，本地生成伪 token
- 数据存储：全部使用 `uni.getStorageSync` / `uni.setStorageSync`
- 测验模块：全部内置在 `src/modules/` 中，离线运行
- 所有模块免费：无支付、无锁定

如需恢复后端版本，请参考 `mind-assessment-uniapp` 项目。
