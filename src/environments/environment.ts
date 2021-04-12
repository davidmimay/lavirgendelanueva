// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  webapp_url: 'http://localhost:4200',
  stripe_key: 'pk_test_M5NhaXg1IekWjTBASQwigw1q', // stripe elements
  stripe_tax: 'txr_1HrSQqLQT86JpABoKMRSme7n',
  stripe_subs_price: 'price_1HziXwLQT86JpABoDiVz681f',
  stripe_prod_price: 'price_1HtuDiLQT86JpABoTu5tRGgZ',
    // stripe API, webhooks, functions
  stripe: {
    testKey: 'rk_test_51DwFfWLQT86JpABovTPM2Y8QzWoLjRDyvJfslVKEeH3fYzX6WxM30r2EFyVkTuII941jh79QoHlahK1SoHilEq6k00OWnYrXTB'
  },
  location: 'europe-west2',
  firebase:  {
    apiKey: 'AIzaSyDherIKIIiOpM5MkIF_T_EQBWFy9BHhbS4',
    authDomain: 'mimay1.firebaseapp.com',
    databaseURL: 'https://mimay1.firebaseio.com',
    projectId: 'mimay1',
    storageBucket: 'mimay1.appspot.com',
    messagingSenderId: '528823231751',
    appId: '1:528823231751:web:5e12e4f488304894f8d1a2',
    measurementId: 'G-2CVBNV4BDL'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
