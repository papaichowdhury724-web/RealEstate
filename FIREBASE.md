# Firebase setup

The app is built around a Firebase-shaped data model. Until you add Firebase keys it
uses the local Postgres fallback automatically. Once the keys below are present,
**every read/write switches to Firestore + Firebase Storage** — no code changes needed.

## 1. Create a Firebase project
1. https://console.firebase.google.com → Add project
2. Build → **Firestore Database** → Create (production mode, region `asia-south1` / Mumbai — closest to Delhi)
3. Build → **Storage** → Get started
4. Project settings → Your apps → Web app → copy the config

## 2. Add to `.env`
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
ADMIN_PASSWORD=choose-a-strong-password
```

## 3. Data structure
| Path | Contents |
|------|----------|
| `settings/site` | The entire website config (`SiteConfig` in `src/lib/types.ts`): brand, texts, header, footer, sections, properties, offers, updates, custom features, feature toggles, booking fields, theme, animations |
| `bookings/{id}` | `{ data: {Label: value}, status: "pending"/"confirmed"/"cancelled", createdAt }` |
| `enquiries/{id}` | `{ name, phone, email, message, coupon, propertyIds[], status, createdAt }` |
| Storage `media/*` | Images & videos uploaded from the admin panel |

## 4. Security rules
Deploy `firestore.rules` and `storage.rules` from this repo (Firebase console → Rules tab, paste).
Writes go through the Next.js API routes (which check the admin session).

## 5. Optional: Firebase Authentication for admin
`src/lib/auth.ts` → `isAdmin()` is the single place to swap the password check for
Firebase Auth ID-token verification (e.g. with `firebase-admin`'s `verifyIdToken`).

## Key files
- `src/lib/firebase/client.ts` — initialisation + collection names
- `src/lib/store.ts` — data adapter (Firestore when configured, Postgres otherwise)
- `src/lib/types.ts` — full typed schema
- `src/lib/defaults.ts` — default content (seed)
