/* tslint:disable */
export interface PaygateTransactionStatusModel {
  transaction_id: string;
  application_id: string;
  amount: number;
  currency: string;
  order_ref: string;
  payment_options: 'instant' | 'preorder';
  expiresAt: Date;
  preorder_end_date: Date;
  createdAt: Date;
  payment: PaymentStatus;
}

export interface PaymentStatus {
  payment_channel_id: number;
  fees: number;
  commission: number;
  createdAt: string;
  channel: string;
  status: string;
}
