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
  line1 = '';
  line2 = '';
  city = '';
  state = '';
  country = '';
  postalCode: number = null;
  phonePrefix = '';
  telephone = '';
  isPreferred = false;
}

export class DocumentModel {
  identifier = '';
  type = 0;

  constructor() {
  }
}
