/** Firebase configuration — replace with your project's config */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDmTe7kho49Elm6FXjHYdMiayJviojqErA",
  authDomain: "scorefit-dev.firebaseapp.com",
  projectId: "scorefit-dev",
  storageBucket: "scorefit-dev.firebasestorage.app",
  messagingSenderId: "357393783635",
  appId: "1:357393783635:ios:b77c5002affae13ff01fa6",
  measurementId: "G-XXXXXXXXXX",
};

/** App-wide configuration */
export const APP_CONFIG = {
  APP_NAME: "ScoreFit",
  API_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  PAGINATION_LIMIT: 20,
  EXPO_PROJECT_ID: "2b429e0e-c286-4753-a67e-d169d7a4c7de",
} as const;

export const BRANCH_CONFIG = {
  DEFAULT_BRANCH_ID: "main",
} as const;
