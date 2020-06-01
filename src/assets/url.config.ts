export class UrlConfig {

  readonly bookingHost = 'https://bip-booking.herokuapp.com';
  readonly mainHost = 'https://bip-event.herokuapp.com';
  // readonly mainHost = 'http://localhost:8081';
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
  readonly searchEventByRef = '/public/events/ref';
  readonly searchTransportByRef = '/public/transports/ref';
  readonly payExpressPaymentRequest = '/request-payment';
  readonly payExpressIpn = '/ipn';

  // amadeus endpoints

  readonly amadeusBaseUrl = 'https://test.api.amadeus.com';
  readonly requestAmadeusToken = this.amadeusBaseUrl + '/v1/security/oauth2/token';
  readonly flightOfferSearch = this.amadeusBaseUrl + '/v2/shopping/flight-offers';
  readonly flightOfferPricing = this.amadeusBaseUrl + '/v1/shopping/flight-offers/pricing';
  readonly flightCreateOrder = this.amadeusBaseUrl + '/v1/booking/flight-orders';
  readonly seatsMap = this.amadeusBaseUrl + '/v1/shopping/seatmaps';

}
