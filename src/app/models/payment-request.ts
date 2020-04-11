export class PaymentRequest {
  item_name: string; // order title
  item_price: number; // order price
  command_name: string; // order description
  ref_command = null;
  env = null;
  ipn_url = null;
  success_url: string;
  cancel_url: string;
  currency = 'XOF';
}
