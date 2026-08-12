# Velora Clinics

A premium wellness/medical member app for Velora Clinics, built with React Native
and Expo SDK 54 (Expo Go compatible).

## Running it

```bash
npm install
npm start          # then scan the QR code with Expo Go
```

```bash
npm run typecheck  # tsc --noEmit
```

The app runs entirely on local mock data — no backend or API keys required.

## Brand

The visual language is defined once, in `src/theme`, and nothing outside that
folder hard-codes a colour, font or radius.

| Token | Value |
| --- | --- |
| Deep Emerald | `#0D3B34` |
| Emerald | `#1F5C4D` |
| Sage | `#B7C6B8` |
| Gold | `#D4AF37` |
| Warm Ivory | `#F7F3EE` |
| Champagne | `#EDE6DC` |

- **Type** — Cormorant Garamond (elegant serif) for headings and numerals,
  Jost (geometric sans) for body and UI. Loaded in `src/hooks/useVeloraFonts.ts`,
  named in `src/theme/typography.ts`.
- **Logo** — the V monogram and VELORA CLINICS wordmark are drawn as vector
  (`src/components/brand/`), so they stay sharp at any size and recolour per
  surface. No raster logo assets.
- **Marble** — emerald, ivory and champagne marble are generated procedurally in
  `src/components/brand/Marble.tsx` from a gradient plus hand-authored vein
  paths. This ships no binary textures and scales to every screen density.
- **Icons** — Feather (thin-line) throughout, tinted emerald or gold.

## Architecture

```
app/                       Expo Router routes (file-based)
  _layout.tsx              Root stack: fonts, providers, screen options
  index.tsx                Splash — also the auth routing gate
  onboarding.tsx           Three-slide carousel
  (auth)/                  Sign in, sign up, password reset
  (tabs)/                  Home, Journey, Appointments, Treatments, Profile
  treatments/[id].tsx      Treatment detail
  doctors/                 Directory and physician profile
  messages/                Threads and conversation
  packages/[id].tsx        Package / treatment progress
  membership.tsx           Tiers and standing
  appointments/book.tsx    Booking flow

src/
  theme/                   Palette, typography, spacing, elevation
  components/
    brand/                 Monogram, wordmark, marble
    ui/                    Screen, Card, Button, TextField, Progress, …
    domain/                Appointment, treatment, doctor, package cards
    layout/                AuthScaffold
  services/                Repository contracts + mock implementation
  providers/AuthProvider   Session state and persistence
  hooks/                   useAsyncData, useVeloraFonts
  types/models.ts          Domain models
  utils/                   Date and formatting helpers
```

### Screens depend on interfaces, not on a backend

`src/services/contracts.ts` declares one interface per domain
(`AuthRepository`, `AppointmentRepository`, …) plus a `VeloraBackend` aggregate.
Screens and hooks import only `api` from `src/services`, which resolves to an
implementation of that aggregate.

Domain models are deliberately transport-agnostic: every field is a primitive
and every timestamp is an ISO-8601 string, so no UI code ever touches a backend
SDK type.

### Swapping in Firebase

1. Add `src/services/firebase/index.ts` exporting a `firebaseBackend` that
   implements `VeloraBackend`. Convert Firestore `Timestamp` values to ISO
   strings at that boundary — that is the only place the conversion belongs.
2. Register it in `resolveBackend()` in `src/services/index.ts`.
3. Set `EXPO_PUBLIC_BACKEND=firebase`.

No screen, component or hook changes. Until step 1 lands, selecting the
`firebase` backend throws on startup rather than silently serving mock data.

`AuthProvider` already models the real lifecycle — cold-start session restore,
persisted credentials, and a `loading` state the splash screen waits on — so
wiring Firebase Auth in behind `AuthRepository` needs no changes to routing.

## Navigation flow

```
Splash ──► Onboarding ──► Sign up ──┐
   │            └──────► Sign in ───┼──► (tabs) Home
   └── restored session ────────────┘
```

The splash screen holds for a minimum beat while `AuthProvider` restores the
persisted session, then routes to onboarding, auth, or the dashboard. The
`(auth)` group redirects signed-in members to the dashboard, and the `(tabs)`
group redirects signed-out visitors to sign in, so neither is reachable in the
wrong state.

## Notes

- Mock sign-in accepts any well-formed email and a password of 6+ characters
  (8+ to register). The session persists to AsyncStorage across app restarts.
- Fixture dates are generated relative to "now", so the dashboard always shows a
  credible upcoming appointment whenever the app is opened.
- Animation uses React Native's built-in `Animated` API only, which keeps the
  app inside what Expo Go can run without a custom dev client.
