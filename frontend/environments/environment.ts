// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://filecabinet.enotolyb.ru/', // 'http://filecabinet.enotolyb.ru/', // http://file-cab.local:3000/
  sentry: {
    dsn: 'https://d04d06eb22c14effb36c76b0453dea5c@o1087993.ingest.sentry.io/6103397',
    tracesSampleRate: 1.0,
  },
  firebase: {
    apiKey: 'AIzaSyD5qwE1oJkYrJCzdcgkHn5iE0dclwO5ZtU',
    authDomain: 'filecab-5454b.firebaseapp.com',
    databaseURL: 'https://filecab-5454b-default-rtdb.firebaseio.com',
    projectId: 'filecab-5454b',
    storageBucket: 'filecab-5454b.appspot.com',
    messagingSenderId: '167501688709',
    appId: '1:167501688709:web:85e0020323cc518ae85eec',
    measurementId: 'G-S2126YXX40',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
