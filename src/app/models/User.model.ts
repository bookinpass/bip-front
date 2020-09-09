export class Role {
  roleName = '';
}

export class Credential {
  username = '';
  password = '';
  role: Role[];
}

export class UserModel {
  firstName = '';
  lastName = '';
  email = '';
  telephone = '';
  line = '';
  city = '';
  state = '';
  postalCode = '';
  countryCode = '';
  idType = '';
  idNumber = '';
  credential: Credential;
}
