export class VariableConfig {

  // variables of the ticket-searching component
  eventType = ['Concert', 'Cinéma', 'Séminaire', 'Foire', 'Forum', 'Tourisme', 'Soirée', 'Gala', 'Lancement', 'Réception', 'Tournée' +
  ' promotionnel', 'Congrès', 'Salon/Exposition', 'Festival', 'Défilé'];
  /*
   * The two following list should be use to set the slide's pictures name,
   *  so the can be add automatically by the function #setSliderImageArray()
   */
  flightSlider = ['../../../assets/images/background/passport.png', '../../../assets/images/background/decolageavion.webp',
    '../../../assets/images/background/aroundTheGlobe.webp', '../../../assets/images/background/plage.webp',
    '../../../assets/images/background/jordanie.webp'];

  eventSlider = ['../../../assets/images/background/outdoor-cinema.png', '../../../assets/images/background/cinema.png',
    '../../../assets/images/background/concert2.png',
    '../../../assets/images/background/foire.png', '../../../assets/images/background/defile.png',
    '../../../assets/images/background/concert.png',
    '../../../assets/images/background/cinema-advert.png', '../../../assets/images/background/cinema-no-screen.png'];

  sportSlider = ['../../../assets/images/background/lamb.png', '../../../assets/images/background/lamb2.png',
    '../../../assets/images/background/beach_fitness.png', '../../../assets/images/background/baseball-stadium.png',
    '../../../assets/images/background/concert.png'];

  // Geolocation API Token from LocationIQ.com
  readonly apiTokenKey = 'pk.1e10b69e20b9998ddc1b0531febc12cb';
  readonly locationDefaultLanguage = 'en';

  // airLines Fare classes category and abbreviations
  readonly fareClasses = {
    Economy: ['Y', 'B', 'H', 'K', 'L', 'G', 'V', 'S', 'N', 'Q', 'O'],
    Premium_Economy: ['W', 'P'],
    Business: ['J', 'C', 'R', 'D', 'I'],
    First: ['F', 'A']
  };

  readonly extension = ['jpg', 'png', 'jpeg', 'webp']; // allowed mimeType for image uploading

  readonly currencyCode = 'XOF';

  // In this array, you can add any domains that are allowed to receive the JWT like public APIs.
  jwtTokenWhiteListDomain = ['localhost:4201'];

  // In this array, you can add routes that are not allowed to receive the JWT token.
  jwtTokenBlackListRoutes = [];

  readonly emailRegex = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

  readonly paypalClientID = 'AXw_WRBFaIrxRT_Hu5t-NeqILen5xynZzNOB9iKXhvLtU6__pCJrTEoGQdtEcO&#45;&#45;2TSXlLYvvahC9gVw';

  readonly locationApiId = 'bookinpass';
  readonly locationApiKey = 'JxiU0T57z7OaJAH0Z4ga33ZKqKQpRTalTx9XrmqFHHdW8RRK';

}
