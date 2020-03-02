export class DakarZiguinchorJson {

  readonly sheet = {
    currency: 'XOF',
    totalWeight: 200,
    handbagWeight: 20,
    weight_unit: 'KG',
    soute: [
      {
        description: 'car',
        price: 63000
      },
      {
        description: 'bike',
        price: 30000
      }
    ],
    resident: [
      {
        type: '1',
        description: 'Cabine 2 places',
        seats: 2,
        price: 26500
      },
      {
        type: '2',
        description: 'Cabine 4 places',
        seats: 4,
        price: 24500
      },
      {
        type: '3',
        description: 'Cabine 8 places',
        seats: 8,
        price: 12500
      },
      {
        type: '4',
        description: 'Fauteuil pullman',
        price: 5000
      }
    ],
    'non-resident': [
      {
        type: '1',
        description: 'Cabine 2 places',
        seats: 2,
        price: 30500
      },
      {
        type: '2',
        description: 'Cabine 4 places',
        seats: 4,
        price: 28900
      },
      {
        type: '3',
        description: 'Cabine 8 places',
        seats: 8,
        price: 18500
      },
      {
        type: '4',
        description: 'Fauteuil pullman',
        price: 15500
      }
    ],
    fromDakar: {
      departure: '20:00',
      arrival: '10:00',
    },
    fromZiguinchor: {
      departure: '13:00',
      arrival: '07:00',
    }
  };
}
