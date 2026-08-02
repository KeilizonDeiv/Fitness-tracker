import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors, spacing, typography, AppColors } from '@/theme';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';

import { useWorkoutStore } from '@/store/workoutStore';
import { useMetricsStore } from '@/store/metricsStore';
import { useWaterStore } from '@/store/waterStore';
import { useProfileStore } from '@/store/profileStore';

import {
  workoutsThisWeek,
  currentStreakDays,
  latestWeight,
  weightChangeKg,
  waterTodayMl,
} from '@/utils/calculations';
import { formatShortDate } from '@/utils/date';

export function DashboardScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const workouts = useWorkoutStore((s) => s.workouts);
  const metrics = useMetricsStore((s) => s.metrics);
  const waterLogs = useWaterStore((s) => s.logs);
  const profile = useProfileStore((s) => s.profile);

  const weekCount = useMemo(() => workoutsThisWeek(workouts), [workouts]);
  const streak = useMemo(() => currentStreakDays(workouts), [workouts]);
  const weight = useMemo(() => latestWeight(metrics), [metrics]);
  const change = useMemo(() => weightChangeKg(metrics), [metrics]);
  const waterToday = useMemo(() => waterTodayMl(waterLogs), [waterLogs]);

  const recentWorkouts = workouts.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hey, {profile.name} 👋</Text>
        <Text style={styles.subGreeting}>Here's your fitness snapshot</Text>

        <View style={styles.statsRow}>
          <StatCard icon="flame" label="Day streak" value={`${streak}`} accent={colors.warning} />
          <StatCard icon="barbell" label="This week" value={`${weekCount}/${profile.weeklyWorkoutTarget}`} accent={colors.primary} />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="body"
            label="Weight"
            value={weight ? `${weight.weightKg} kg` : '—'}
            accent={colors.accent}
          />
          <StatCard
            icon="trending-down"
            label="Change"
            value={change !== undefined ? `${change > 0 ? '+' : ''}${change.toFixed(1)} kg` : '—'}
            accent={change !== undefined && change < 0 ? colors.success : colors.danger}
          />
        </View>

        <Card style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <Text style={styles.cardTitle}>Hydration today</Text>
            <Text style={styles.hydrationValue}>
              {waterToday} / {profile.dailyWaterTargetMl} ml
            </Text>
          </View>
          <ProgressBar progress={waterToday / profile.dailyWaterTargetMl} color={colors.primary} height={10} />
        </Card>

        <Text style={styles.sectionTitle}>Recent workouts</Text>
        {recentWorkouts.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="No workouts yet"
            subtitle="Log your first session from the Workouts tab"
          />
        ) : (
          recentWorkouts.map((w) => (
            <Card key={w.id} style={styles.workoutCard}>
              <View style={styles.workoutRow}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutDate}>{formatShortDate(w.date)}</Text>
              </View>
              <Text style={styles.workoutMeta}>
                {w.durationMin} min · {w.exercises.length} exercises · {w.caloriesBurned} kcal
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    greeting: { ...typography.h1, color: colors.textPrimary },
    subGreeting: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    hydrationCard: { marginBottom: spacing.xl, gap: spacing.sm },
    hydrationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { ...typography.h3, color: colors.textPrimary },
    hydrationValue: { ...typography.caption, color: colors.textSecondary },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
    workoutCard: { marginBottom: spacing.sm },
    workoutRow: { flexDirection: 'row', justifyContent: 'space-between' },
    workoutName: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
    workoutDate: { ...typography.caption, color: colors.textMuted },
    workoutMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  });
