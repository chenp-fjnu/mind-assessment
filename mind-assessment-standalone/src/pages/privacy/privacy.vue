<template>
  <view class="privacy-container">
    <view class="privacy-card">
      <text class="privacy-title">隐私政策</text>
      <text class="privacy-date">更新日期：2026年7月27日</text>

      <view class="privacy-section">
        <text class="section-title">1. 引言</text>
        <text class="section-text">
          心智测验（以下简称"我们"或"本应用"）重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用我们的服务前仔细阅读本政策。
        </text>
      </view>

      <view class="privacy-section">
        <text class="section-title">2. 信息收集</text>
        <text class="section-text">
          我们可能收集以下类型的信息：
        </text>
        <view class="bullet-list">
          <text class="bullet-item">• 账户信息：如微信OpenID、手机号码等用于身份识别的信息</text>
          <text class="bullet-item">• 测验数据：您完成的测验答案、得分、评估结果</text>
          <text class="bullet-item">• 设备信息：设备型号、操作系统版本、网络状态</text>
          <text class="bullet-item">• 使用数据：功能使用频率、停留时长、操作记录</text>
        </view>
      </view>

      <view class="privacy-section">
        <text class="section-title">3. 信息使用</text>
        <text class="section-text">
          我们使用您的信息用于以下目的：
        </text>
        <view class="bullet-list">
          <text class="bullet-item">• 提供、维护和改进我们的服务</text>
          <text class="bullet-item">• 生成个性化的测验报告和建议</text>
          <text class="bullet-item">• 同步您的历史记录到云端</text>
          <text class="bullet-item">• 发送服务通知和更新信息</text>
          <text class="bullet-item">• 进行数据分析和研究，以改善用户体验</text>
        </view>
      </view>

      <view class="privacy-section">
        <text class="section-title">4. 信息存储与安全</text>
        <text class="section-text">
          我们采用行业标准的安全措施保护您的个人信息，包括数据加密、访问控制和安全审计。您的测验记录将加密存储，未经授权的第三方无法访问。我们仅在实现本政策所述目的所需的时间内保留您的信息。
        </text>
      </view>

      <view class="privacy-section">
        <text class="section-title">5. 信息共享</text>
        <text class="section-text">
          我们不会向第三方出售您的个人信息。仅在以下情况下可能共享信息：
        </text>
        <view class="bullet-list">
          <text class="bullet-item">• 获得您的明确同意</text>
          <text class="bullet-item">• 遵守法律法规或政府机关的要求</text>
          <text class="bullet-item">• 与可信赖的服务提供商合作，且其受保密协议约束</text>
        </view>
      </view>

      <view class="privacy-section">
        <text class="section-title">6. 用户权利</text>
        <text class="section-text">
          您对自己的个人信息享有以下权利：
        </text>
        <view class="bullet-list">
          <text class="bullet-item">• 访问和查看您的个人信息</text>
          <text class="bullet-item">• 更正不准确或不完整的信息</text>
          <text class="bullet-item">• 删除您的账户和相关数据</text>
          <text class="bullet-item">• 撤回对信息处理的同意</text>
        </view>
      </view>

      <view class="privacy-section">
        <text class="section-title">7. 未成年人保护</text>
        <text class="section-text">
          我们的服务面向年满18周岁的成年人。如果您是未成年人，请在监护人陪同下使用，并由监护人同意本隐私政策。我们不会故意收集未成年人的个人信息。
        </text>
      </view>

      <view class="privacy-section">
        <text class="section-title">8. 政策更新</text>
        <text class="section-text">
          我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，重大变更将通过适当方式通知您。继续使用我们的服务即表示您同意修订后的政策。
        </text>
      </view>

      <view class="privacy-section">
        <text class="section-title">9. 联系我们</text>
        <text class="section-text">
          如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
        </text>
        <view class="bullet-list">
          <text class="bullet-item">• 客服邮箱：support@mindassessment.com</text>
          <text class="bullet-item">• 客服电话：400-123-4567</text>
        </view>
      </view>

      <view class="privacy-footer">
        <text class="footer-text">感谢您信任并使用心智测验。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  uni.setNavigationBarTitle({ title: '隐私政策' })
})
</script>

<style scoped>
.privacy-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 30rpx;
}

.privacy-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.privacy-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 10rpx;
}

.privacy-date {
  font-size: 24rpx;
  color: #999;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}

.privacy-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.section-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
  display: block;
}

.bullet-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 10rpx;
  padding-left: 10rpx;
}

.bullet-item {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

.privacy-footer {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  text-align: center;
}

.footer-text {
  font-size: 26rpx;
  color: #999;
}
</style>
