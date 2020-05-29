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

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static dotProduct(v1, v2) {
    return (v1.x * v2.x + v1.y * v2.y);
  }

  static vectorFromIndex(i, w) {
    return new Vector(i % w, Math.floor(i / w));
  }

  static linearInterpolation(known, v1, v2) {
    const denominator = v2.x - v1.x;
    const numerator1 = v1.y * (v2.x - known);
    const numerator2 = v2.y * (known - v1.x);

    return (numerator1 + numerator2) / denominator;
  }

  static bilinearInterpolation(goalV, dotProducts) {
    const v1 = new Vector(0, dotProducts[0]);
    const v2 = new Vector(1, dotProducts[1]);
    const v3 = new Vector(0, dotProducts[2]);
    const v4 = new Vector(1, dotProducts[3]);

    const AB = Vector.linearInterpolation(goalV.x, v1, v2);
    const CD = Vector.linearInterpolation(goalV.x, v3, v4);

    const v5 = new Vector(0, AB);
    const v6 = new Vector(1, CD);
    const ABCD = Vector.linearInterpolation(goalV.y, v5, v6);

    return ABCD;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const length = this.magnitude();
    const { x, y } = this;
    return new Vector(x / length, y / length);
  }

  subtract(v) {
    const { x, y } = this;
    return new Vector(x - v.x, y - v.y);
  }

  indexFromVector(w) {
    const { x, y } = this;
    return x + y * w;
  }
}
