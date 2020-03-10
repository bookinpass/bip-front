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
  country = '';
  idType = '';
  idNumber = '';
  credential: Credential;
}
