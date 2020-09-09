/* tslint:disable */
export interface PaygateTransactionResponseModel {
  transaction_id: string;
  amount: number;
  currency: string;
  order_ref: string;
  payment_options: 'instant' | 'preorder';
  expiresAt: Date;
  preorder_end_date: Date;
  createdAt: Date;
  capture_url: string;
}
