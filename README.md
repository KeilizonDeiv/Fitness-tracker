# FitTrack — Cross-Platform Fitness Tracker (React Native + Expo)

A full-featured, offline-first fitness tracker built with React Native (Expo),
TypeScript, Zustand, and AsyncStorage. Runs on iOS, Android, and web from one
codebase.

## Features

- **Workouts** — full CRUD: create/edit/delete workouts, and within each
  workout, add/remove exercises and sets (reps × weight). Auto-calculates
  total volume and set count.
- **Dashboard** — streak counter, weekly workout progress, weight trend,
  hydration progress, recent workouts.
- **Body metrics** — log weight / body fat over time, mini bar-chart trend,
  BMI calculation, full history with delete.
- **Hydration** — quick-add buttons (150/250/500/750ml), daily goal progress
  bar, per-entry log with delete.
- **Profile & Goals** — editable profile (name, height, targets), CRUD goals
  (target weight, weekly workout count, daily water).
- All data persists locally via AsyncStorage — works fully offline.

## Architecture

```
src/
├── theme/         Design tokens: colors, spacing, radius, typography.
│                   Nothing hardcodes a hex value outside this folder.
├── types/          Domain models (Workout, Exercise, SetEntry, BodyMetric,
│                   WaterLog, Goal, UserProfile) + generic Repository<T>
│                   interface that every store is built on.
├── services/       storageService.ts — a generic AsyncStorage-backed
│                   repository implementing getAll/getById/create/update/
│                   remove for ANY entity. Stores compose this instead of
│                   re-implementing persistence.
├── store/          Zustand slices (one per domain): workoutStore,
│                   metricsStore, waterStore, goalsStore, profileStore.
│                   Each exposes hydrate() + CRUD actions + in-memory state.
│                   Screens never touch AsyncStorage directly — only stores.
├── utils/          Pure functions: id generation, date formatting,
│                   fitness calculations (streaks, volume, BMI, hydration).
├── components/      Reusable, theme-driven UI primitives: Button, Card,
│                   Input, StatCard, ProgressBar, ListRow, EmptyState,
│                   ConfirmDialog, ScreenHeader. Screens compose these
│                   rather than writing raw View/Text everywhere.
├── navigation/      RootNavigator (stack) + TabNavigator (bottom tabs) +
│                   typed param lists for full navigation type-safety.
└── screens/         One folder per feature area (Dashboard, Workouts,
                    Metrics, Water, Profile), each containing only screen
                    components — no business logic lives here.
```

### Why this structure

- **Separation of concerns**: UI (screens/components) never talks to
  storage directly — it goes through stores, which go through the generic
  repository. Swapping AsyncStorage for SQLite or a REST API later means
  changing `storageService.ts` only.
- **Generic CRUD**: `AsyncStorageRepository<T>` + `Repository<T>` means
  every new entity (e.g. a future "Meals" feature) gets full CRUD by writing
  ~10 lines of store code, not reinventing persistence.
- **Single design-token source**: `theme/` is the only place colors/spacing
  are defined, so restyling the whole app means editing one file.
- **Typed navigation**: `RootStackParamList` / `TabParamList` catch invalid
  route params at compile time.

## Getting started

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR
code with the Expo Go app on your phone.

## Possible next steps

- Add charts via `react-native-svg` / `victory-native` for richer trend
  visualizations.
- Add a workout-history calendar view.
- Sync to a backend (Supabase/Firebase) by implementing a second
  `Repository<T>` and swapping it in per store.
- Push notifications for hydration/workout reminders (`expo-notifications`).
