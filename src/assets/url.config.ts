export class UrlConfig {

  readonly host = 'https://bip-booking.herokuapp.com';
  readonly eventHost = 'https://bip-event.herokuapp.com';
  // readonly eventHost = 'http://localhost:8081';
  readonly generateCode = '/forgotten/password';
  readonly checkCode = '/forgotten/password/check';
  readonly resetPassword = '/password/reset';
  readonly imageUrl = '/public/image';
  readonly loginUrl = '/login';
  readonly registerUrl = '/register';
  readonly activateAccount = '/register/activate';
  readonly checkEmail = '/valid/email/';
  readonly checkTelephone = '/valid/telephone/';
  readonly checkUsername = '/valid/username/';
  readonly sendSmsNotification = '/send/sms';
  readonly clients = '/user/search';
  readonly getPlaces = '/public/places';
  readonly eventById = '/public/events/';
  readonly comingEvents = '/public/events/coming';
  readonly searchFlights = '/public/search';
  readonly nextEvents = '/public/events/next-event';

}
