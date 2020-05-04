// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from 'firebase/app';

export const setupFirebase = (APIKEY) => {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: APIKEY,
    authDomain: 'asteroids-1e3b1.firebaseapp.com',
    databaseURL: 'https://asteroids-1e3b1.firebaseio.com',
    projectId: 'asteroids-1e3b1',
    storageBucket: '',
    messagingSenderId: '591801633463',
  };

  firebase.initializeApp(firebaseConfig);
  
  return firebase;
};

export const rotate = (point, d) => {
  const angle = d * (Math.PI / 180);
  const newPoint = { x: 0, y: 0 };
  newPoint.x = (point.x * (Math.cos(angle)) - point.y * (Math.sin(angle)));
  newPoint.y = (point.y * (Math.cos(angle)) + point.x * (Math.sin(angle)));
  return newPoint;
};

