import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme';

import { useWorkoutStore } from '@/store/workoutStore';
import { useMetricsStore } from '@/store/metricsStore';
import { useWaterStore } from '@/store/waterStore';
import { useGoalsStore } from '@/store/goalsStore';
import { useProfileStore } from '@/store/profileStore';

export default function App() {
  const [ready, setReady] = useState(false);

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
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
