import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useColors } from '@/theme';

import { TabNavigator } from './TabNavigator';
import { WorkoutFormScreen } from '@/screens/Workouts/WorkoutFormScreen';
import { WorkoutDetailScreen } from '@/screens/Workouts/WorkoutDetailScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colors = useColors();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.bg,
        card: colors.bgElevated,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
      },
    }),
    [colors]
  );

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="WorkoutForm"
          component={WorkoutFormScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
