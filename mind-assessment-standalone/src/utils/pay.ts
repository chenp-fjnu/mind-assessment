/**
 * 支付工具 - 纯本地模式（无后端）
 * 所有模块已免费，支付页不会被触发
 */

export interface PaymentOrder {
  provider: 'wxpay' | 'alipay';
  amount: number;
  orderNo: string;
  description: string;
  attach?: string;
}

export async function requestPayment(_order: PaymentOrder): Promise<void> {
  return Promise.resolve();
}
