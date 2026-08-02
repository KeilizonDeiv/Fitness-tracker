import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors, radius, spacing, typography, AppColors } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';

import { useWaterStore } from '@/store/waterStore';
import { useProfileStore } from '@/store/profileStore';
import { waterTodayMl } from '@/utils/calculations';
import { isSameDay } from '@/utils/date';

const QUICK_AMOUNTS = [150, 250, 500, 750];

export function WaterScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const logs = useWaterStore((s) => s.logs);
  const addLog = useWaterStore((s) => s.addLog);
  const removeLog = useWaterStore((s) => s.removeLog);
  const profile = useProfileStore((s) => s.profile);

  const todayTotal = useMemo(() => waterTodayMl(logs), [logs]);
  const todayLogs = useMemo(() => {
    const now = new Date().toISOString();
    return logs.filter((l) => isSameDay(l.date, now));
  }, [logs]);

  const progress = todayTotal / profile.dailyWaterTargetMl;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Hydration" subtitle="Track your daily water intake" />

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{todayTotal} ml</Text>
          <Text style={styles.summaryTarget}>of {profile.dailyWaterTargetMl} ml goal</Text>
          <ProgressBar progress={progress} height={10} />
          {progress >= 1 && <Text style={styles.goalHit}>🎉 Goal reached today!</Text>}
        </Card>

        <Text style={styles.sectionTitle}>Quick add</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((amount) => (
            <Pressable key={amount} style={styles.quickBtn} onPress={() => addLog(amount)}>
              <Text style={styles.quickBtnText}>+{amount}ml</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Today's log</Text>
        {todayLogs.length === 0 ? (
          <EmptyState icon="water-outline" title="No water logged yet today" />
        ) : (
          todayLogs.map((log) => (
            <ListRow
              key={log.id}
              title={`${log.amountMl} ml`}
              subtitle={new Date(log.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              onDelete={() => removeLog(log.id)}
            />
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
    summaryCard: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
    summaryValue: { ...typography.h1, color: colors.primary },
    summaryTarget: { ...typography.caption, color: colors.textSecondary },
    goalHit: { ...typography.body, color: colors.success, marginTop: spacing.xs },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
    quickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, flexWrap: 'wrap' },
    quickBtn: {
      flexGrow: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    quickBtnText: { ...typography.h3, fontSize: 14, color: colors.primary },
  });
