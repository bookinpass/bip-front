export class ClientModel {
  codeClient: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  addresses = new Array<AddressModel>();
  documents = new Array<DocumentModel>();
  gender: number;
  state: boolean;
}

export class AddressModel {
  idAddress: number;
  line1: string = '';
  line2: string = '';
  city: string = '';
  state: string = '';
  country: string = '';
  postalCode: number = null;
  phonePrefix: string = '';
  telephone: string = '';
  isPreferred: boolean = false;
}

export class DocumentModel {
  constructor(){ }
  identifier: string = '';
  type: number = 0;
}
