import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { useColors } from '@/theme';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { WorkoutListScreen } from '@/screens/Workouts/WorkoutListScreen';
import { MetricsScreen } from '@/screens/Metrics/MetricsScreen';
import { WaterScreen } from '@/screens/Water/WaterScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Workouts: 'barbell',
  Metrics: 'body',
  Water: 'water',
  Profile: 'person-circle',
};

export function TabNavigator() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof TabParamList]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutListScreen} />
      <Tab.Screen name="Metrics" component={MetricsScreen} />
      <Tab.Screen name="Water" component={WaterScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
