import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { SplashScreen } from '@/screens/Onboarding/SplashScreen';
import { OnboardingScreen } from '@/screens/Onboarding/OnboardingScreen';

import { useWorkoutStore } from '@/store/workoutStore';
import { useMetricsStore } from '@/store/metricsStore';
import { useWaterStore } from '@/store/waterStore';
import { useGoalsStore } from '@/store/goalsStore';
import { useProfileStore } from '@/store/profileStore';

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  const hydrateWorkouts = useWorkoutStore((s) => s.hydrate);
  const hydrateMetrics = useMetricsStore((s) => s.hydrate);
  const hydrateWater = useWaterStore((s) => s.hydrate);
  const hydrateGoals = useGoalsStore((s) => s.hydrate);
  const hydrateProfile = useProfileStore((s) => s.hydrate);

  useEffect(() => {
    (async () => {
      await Promise.all([
        hydrateWorkouts(),
        hydrateMetrics(),
        hydrateWater(),
        hydrateGoals(),
        hydrateProfile(),
      ]);
      setOnboarded(useProfileStore.getState().profile.hasOnboarded);
      setHydrated(true);
    })();
  }, []);

  if (!hydrated || !splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!onboarded) {
    return <OnboardingScreen onDone={() => setOnboarded(true)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
