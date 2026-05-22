export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  description: string;
}

export interface AppliedPromo {
  code: string;
  type: string;
  discountAmount: number;
  description: string;
}
