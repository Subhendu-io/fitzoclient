# Fitzo Client Migration & Redesign Plan

This plan details the migration of the existing bare React Native `Fitzo-client` into the new Expo environment at `fitzoclint`. It also outlines the overhaul to a modern dark-theme UI with neon green accents, matching the provided design references.

## User Review Required
> [!IMPORTANT]
> - **Firebase in Expo:** We will continue to use `@react-native-firebase/*` libraries. Since this is an Expo project, we will rely on Expo Config Plugins to handle the native Firebase integrations. You will need to build the app using EAS or prebuild (`npx expo prebuild`) since these require native code.
> - **Expo Router:** Moving from React Navigation stack/tab definitions to Expo Router file-based routing will dramatically change the file structure. We will recreate your Auth flow into a [(auth)](file:///Users/subhendu/Projects/Fitzo/Fitzo-client/src/screens/main/SessionScreen.tsx#82-87) group and the Main tabs into a [(tabs)](file:///Users/subhendu/Projects/Fitzo/Fitzo-client/src/screens/main/SessionScreen.tsx#82-87) group inside the `app/` directory.

## 1. Project Scaffolding & Dependencies
The target directory `fitzoclint` is already initialized with NativeWind. We need to complete the installation of the core stack:
- **Routing:** Expo Router (already included in standard Expo scaffolding, but needs layout setup).
- **State Management:** `zustand` and `@react-native-async-storage/async-storage` for persistence.
- **Data Fetching:** `@tanstack/react-query`.
- **Validation:** `zod` for schemas.
- **Backend:** `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, etc.
- **Animations:** `react-native-reanimated`.

## 2. Global Styling & Theming (NativeWind)
We will align the Tailwind configuration with the provided design reference:
- **Base Mode:** Forced dark mode.
- **Colors:**
  - `background`: Very dark grey/black (`#0D0D0D`).
  - `card`: Surface/bento box background (`#1A1A1A`).
  - `primary`: Vibrant neon green (`#C8FF32` or similar).
  - `text`: Pure white to soft grey for secondary text.
- **Typography:** Utilize the existing Kanit or similar modern font explicitly.
- **Components:** Create highly reusable NativeWind components (e.g., green primary buttons, glass-morphism cards, blurred bottom navigation).

## 3. State Management & Data Flow Architecture
We will replace the heavy React Context providers with Zustand stores:
- **`useAuthStore`:** Stores the global Auth state and user session.
- **`useMemberStore`:** Stores gym membership status and physical stats.
- **Data Fetching:** TanStack Query `useQuery` hooks will wrap our existing Firebase service calls (`memberDataService`, etc.) to provide automatic caching, loading states, and background refetching.

## 4. Expo Router File Structure
We will map the existing navigation tree to the `app/` directory:

```
fitzoclint/app/
├── _layout.tsx               # Root Layout (QueryClientProvider, Auth Guarding)
├── (auth)/
│   ├── _layout.tsx           # Auth Stack
│   ├── login.tsx             # Login Screen
│   ├── signup.tsx            # Signup Screen
│   └── join-gym.tsx          # Join Gym Code Flow
└── (tabs)/
    ├── _layout.tsx           # Custom blurred Bottom Tab Navigator
    ├── index.tsx             # Home Tab (Dashboard)
    ├── fitness.tsx           # Fitness Tab
    ├── gym.tsx               # Gym Tab
    └── community.tsx         # Community Tab
```

## 5. UI Screen Redesign (Phased Rollout)
We will rebuild each screen from scratch utilizing `className` blocks for NativeWind, inspired by the reference image.

### Phase 5.1: Auth & Onboarding Redesign
- Large neon green typography and full bleed imagery.
- Smooth Reanimated transitions between steps.
- Floating translucent text inputs powered by NativeWind.

### Phase 5.2: The Home Dashboard
- **Health Grade:** Implement the circular progress chart at the top.
- **Health Metrics Cards:** Convert stats to the 2x2 grid (Blood Pressure, Heart rate, etc).
- **Featured Workout:** Swap text lists for horizontal scrollable image cards.

### Phase 5.3: Workout List/Detail
- Use Reanimated shared element transitions (or similar smooth native fluid routing) when tapping a workout category to see the details.
- Implement the "Dynamic Warmup" vertical list with trailing action buttons.

## Verification Plan

### Automated Steps
- Ensure TypeScript errors remain at `0` under the new strict setup.
- Verify Expo Router correctly resolves all routes.
- Lint Tailwind class names using the NativeWind ESLint rules.

### Manual Verification
- Start the server (`npx expo start -c`) and verify the UI on the Expo Go app or iOS Simulator.
- Test the complete Authentication state block inside the `_layout.tsx` router.
- Verify Firebase config plugins build successfully without native compilation errors.
