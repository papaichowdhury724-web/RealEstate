// Firebase initialisation. Fill these env vars in `.env` to switch the whole
// app from the local Postgres fallback to Firebase (Firestore + Storage).
//
// NEXT_PUBLIC_FIREBASE_API_KEY=
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
// NEXT_PUBLIC_FIREBASE_APP_ID=
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseEnabled = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export function getFirebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

// Collection / document paths used across the app
export const FB = {
  settingsDoc: ["settings", "site"] as const,
  bookings: "bookings",
  enquiries: "enquiries",
  subscribers: "subscribers",
  storageMedia: "media",
};
