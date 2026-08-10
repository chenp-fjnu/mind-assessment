# 后端 API 接口文档

## 认证相关 /api/auth

### POST /api/auth/wx-login
小程序/APP 微信登录
- Body: `{ code: string, platform: 'mp' | 'app' }`
- Response: `{ token: string, openid: string, userInfo: UserInfo }`

### POST /api/auth/h5-wechat-login
H5 微信 OAuth2 登录
- Body: `{ code: string, platform: 'h5' }`
- Response: `{ token: string, openid: string, userInfo: UserInfo }`

### POST /api/auth/phone-login
手机号验证码登录
- Body: `{ phone: string, code: string, platform: 'h5' }`
- Response: `{ token: string, userInfo: UserInfo }`

### POST /api/auth/send-sms
发送短信验证码
- Body: `{ phone: string }`
- Response: `{ success: boolean, message?: string }`

### POST /api/auth/wx-phone-login
小程序手机号一键登录
- Body: `{ phoneCode: string, platform: 'mp' }`
- Response: `{ token: string, openid: string, userInfo: UserInfo }`

### POST /api/auth/refresh
刷新 Token
- Headers: `Authorization: Bearer {token}`
- Response: `{ token: string }`

### POST /api/auth/logout
退出登录
- Headers: `Authorization: Bearer {token}`
- Response: `{ success: boolean }`

## 支付相关 /api/pay

### POST /api/pay/create
创建支付订单
- Body: `{ provider, amount, orderNo, description, attach, platform, openid? }`
- Response: 根据 platform 返回对应支付参数

### POST /api/pay/wx-jsconfig
获取微信 JSSDK 配置
- Body: `{ url: string }`
- Response: `{ appId, timestamp, nonceStr, signature }`

### GET /api/pay/status
查询订单状态
- Query: `{ orderNo: string }`
- Response: `{ orderNo, status: 'pending'|'paid'|'failed', paidAt? }`

## 测验相关 /api/assessment

### GET /api/assessment/modules
获取测验模块列表
- Response: `{ modules: Module[] }`

### GET /api/assessment/questions
获取题目
- Query: `{ moduleId: string }`
- Response: `{ questions: Question[] }`

### POST /api/assessment/submit
提交答案
- Body: `{ moduleId, answers, duration }`
- Response: `{ reportId, score, result }`

### GET /api/assessment/report
获取报告
- Query: `{ reportId: string }`
- Response: `{ report: Report }`

## 游戏相关 /api/game

### POST /api/game/result
提交游戏成绩
- Body: `{ gameId, score, level, duration, details }`
- Response: `{ success, rank? }`

### GET /api/game/leaderboard
获取排行榜
- Query: `{ gameId, period: 'day'|'week'|'all' }`
- Response: `{ ranks: Rank[] }`

## 用户相关 /api/user

### GET /api/user/info
获取用户信息
- Headers: `Authorization: Bearer {token}`
- Response: `{ userInfo: UserInfo }`

### GET /api/user/history
获取测验历史
- Headers: `Authorization: Bearer {token}`
- Query: `{ page, size }`
- Response: `{ records, total }`
