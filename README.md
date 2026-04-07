# ScoreFit Client App

A React Native application built with Expo and a scalable, feature-based architecture.

## Development Workflow

This project uses **Expo Dev Client** and the **Native Firebase SDK** (`@react-native-firebase`) for the best mobile performance and background feature support.

### 🛠 Development

**Target**: Expo Dev Client

- Run native builds locally to include custom modules.
- Supports hot-reloading for JS changes.

```bash
npx expo run:ios
# or
npx expo run:android
```

### 🧪 Testing

**Target**: EAS Build (preview)

- Continuous Integration / Continuous Deployment.
- Distributed via EAS for internal testing.

```bash
eas build --profile preview
```

### 🚀 Production

**Target**: EAS Build (production)

- Optimized builds for App Store and Play Store.

```bash
eas build --profile production
```

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 55)
- **Dev Tool**: [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Server Data**: [TanStack Query](https://tanstack.com/query/latest)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/)
- **Backend/Database**: [Native Firebase SDK](https://rnfirebase.io/) (`@react-native-firebase/app`, `auth`, `firestore`, etc.)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

- Android: Ensure `google-services.json` is in the root.
- iOS: Ensure `GoogleService-Info.plist` is in the root.
- The app is configured to use these files automatically via `app.json`.

### 3. Run Development Build

You **must** use the Development Build instead of Expo Go:

```bash
npx expo start --dev-client
```

## Push Notifications

Push notifications are handled via `expo-notifications` and `@react-native-firebase/messaging`.

- **Registration**: See `src/features/notifications/services/notificationService.ts`.
- **Note**: Requires a physical device and a Development Build.

## Project Structure

```text
app/                     # Main routing (Expo Router)
src/
├── components/          # Reusable UI components
├── constants/           # Design tokens
├── features/            # Feature-based logic
├── lib/                 # Library initializations (Native Firebase)
├── services/            # Global API/Database service layers
├── store/               # Global state (Zustand)
└── utils/               # Helpers and formatters
```
