export class UrlConfig {
  /*
   * Set all url as HTTPS to avoid "Blocked loading mixed active content” issue
   */
  readonly host = 'https://booking.j.layershift.co.uk';
  readonly eventHost = 'https://bip-event.herokuapp.com';
  // readonly eventHost = 'http://localhost:8081';

  readonly airportUrl = '/public/airport';
  readonly directFlightTicketUrl = '/public/vol/tickets';
  readonly oneStopoverTicketUrl = '/public/vol/tickets/stopover/one';
  readonly searchTicketsByCode = '/public/vol/tickets';
  readonly imageUrl = '/public/image';
  readonly loginUrl = '/login';
  readonly registerUrl = '/public/clients/register';
  readonly doesEmailExist = '/public/clients/exist/';
  readonly clients = '/secure/clients';
  readonly getPlaces = '/public/places';
  readonly eventById = '/public/events/';
  readonly comingEvents = '/public/events/coming';
  readonly searchFlights = '/public/search';
  readonly nextEvents = '/public/events/next-event';

}
