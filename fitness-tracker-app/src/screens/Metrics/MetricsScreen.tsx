import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useMetricsStore } from '@/store/metricsStore';
import { useProfileStore } from '@/store/profileStore';
import { todayISO, formatShortDate } from '@/utils/date';
import { bmi } from '@/utils/calculations';

export function MetricsScreen() {
  const metrics = useMetricsStore((s) => s.metrics);
  const addMetric = useMetricsStore((s) => s.addMetric);
  const deleteMetric = useMetricsStore((s) => s.deleteMetric);
  const profile = useProfileStore((s) => s.profile);

  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...metrics].sort((a, b) => (a.date > b.date ? -1 : 1)),
    [metrics]
  );
  const chartData = useMemo(() => sorted.slice(0, 8).reverse(), [sorted]);
  const maxWeight = Math.max(...chartData.map((m) => m.weightKg), 1);
  const currentBmi = sorted[0] ? bmi(sorted[0].weightKg, profile.heightCm) : undefined;

  const handleSave = async () => {
    const weightKg = Number(weightInput);
    if (!weightKg || weightKg <= 0) return;
    await addMetric({
      date: todayISO(),
      weightKg,
      bodyFatPct: bodyFatInput ? Number(bodyFatInput) : undefined,
    });
    setWeightInput('');
    setBodyFatInput('');
    setShowForm(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Body Metrics"
          subtitle={currentBmi ? `BMI ${currentBmi}` : 'Log your first entry'}
          onAddPress={() => setShowForm((v) => !v)}
        />

        {showForm && (
          <Card style={styles.formCard}>
            <Input
              label="Weight (kg)"
              keyboardType="numeric"
              placeholder="e.g. 68.5"
              value={weightInput}
              onChangeText={setWeightInput}
            />
            <Input
              label="Body fat % (optional)"
              keyboardType="numeric"
              placeholder="e.g. 18"
              value={bodyFatInput}
              onChangeText={setBodyFatInput}
            />
            <Button label="Save entry" onPress={handleSave} />
          </Card>
        )}

        {chartData.length > 1 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Recent trend</Text>
            <View style={styles.chartRow}>
              {chartData.map((m) => (
                <View key={m.id} style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      { height: Math.max(8, (m.weightKg / maxWeight) * 80) },
                    ]}
                  />
                  <Text style={styles.barLabel}>{formatShortDate(m.date)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>History</Text>
        {sorted.length === 0 ? (
          <EmptyState icon="body-outline" title="No entries yet" subtitle="Log your weight to start tracking" />
        ) : (
          sorted.map((m) => (
            <ListRow
              key={m.id}
              title={`${m.weightKg} kg`}
              subtitle={`${formatShortDate(m.date)}${m.bodyFatPct ? ` · ${m.bodyFatPct}% body fat` : ''}`}
              onDelete={() => setPendingDeleteId(m.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={!!pendingDeleteId}
        title="Delete entry?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteMetric(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  formCard: { marginBottom: spacing.lg, gap: spacing.sm },
  chartCard: { marginBottom: spacing.xl },
  chartTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 110 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs },
  bar: { width: '70%', backgroundColor: colors.primary, borderRadius: radius.sm },
  barLabel: { ...typography.caption, fontSize: 10, color: colors.textMuted },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
});
