export class UrlConfig {
  /*
   * Set all url as HTTPS to avoid "Blocked loading mixed active content” issue
   */
  readonly host = 'https://booking.j.layershift.co.uk';
  // readonly eventHost = 'https://bip-event.herokuapp.com';
  readonly eventHost = 'http://localhost:8081';
  readonly generateCode = '/forgotten/password';
  readonly checkCode = '/forgotten/password/check';
  readonly resetPassword = '/password/reset';
  readonly imageUrl = '/public/image';
  readonly loginUrl = '/login';
  readonly registerUrl = '/public/clients/register';
  readonly doesEmailExist = '/public/clients/exist/';
  readonly clients = '/user/search';
  readonly getPlaces = '/public/places';
  readonly eventById = '/public/events/';
  readonly comingEvents = '/public/events/coming';
  readonly searchFlights = '/public/search';
  readonly nextEvents = '/public/events/next-event';

}
