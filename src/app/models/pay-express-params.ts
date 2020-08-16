export class PayExpressParams {
  item_name: string; // order title
  item_price: number; // order price
  command_name: string; // order description
  ref_command = null;
  env = null;
  ipn_url = null;
  success_url: string;
  cancel_url: string;
  currency = 'XOF';
  custom_field: any;
}

export class PayExpressCustomField {
  id: string;
  type: string;
  tickets = new Map<string, string>();
}
