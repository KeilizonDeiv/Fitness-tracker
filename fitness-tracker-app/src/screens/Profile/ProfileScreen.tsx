import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useProfileStore } from '@/store/profileStore';
import { useGoalsStore } from '@/store/goalsStore';
import { GoalType } from '@/types';

const GOAL_TYPES: { type: GoalType; label: string }[] = [
  { type: 'weight_target', label: 'Target weight (kg)' },
  { type: 'weekly_workouts', label: 'Workouts per week' },
  { type: 'daily_water_ml', label: 'Daily water (ml)' },
];

export function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);

  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(String(profile.heightCm));
  const [goalType, setGoalType] = useState<GoalType>('weight_target');
  const [goalValue, setGoalValue] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleSaveProfile = () => {
    updateProfile({ name: name.trim() || profile.name, heightCm: Number(height) || profile.heightCm });
  };

  const handleAddGoal = async () => {
    const target = Number(goalValue);
    if (!target) return;
    const meta = GOAL_TYPES.find((g) => g.type === goalType)!;
    await addGoal({ type: goalType, label: meta.label, target });
    setGoalValue('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Your details</Text>
          <Input label="Name" value={name} onChangeText={setName} onEndEditing={handleSaveProfile} />
          <Input
            label="Height (cm)"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            onEndEditing={handleSaveProfile}
          />
          <Button label="Save" variant="secondary" onPress={handleSaveProfile} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Add a goal</Text>
          <View style={styles.chipRow}>
            {GOAL_TYPES.map((g) => (
              <Button
                key={g.type}
                label={g.label}
                variant={goalType === g.type ? 'primary' : 'ghost'}
                onPress={() => setGoalType(g.type)}
                style={styles.chipBtn}
              />
            ))}
          </View>
          <Input
            label="Target value"
            keyboardType="numeric"
            value={goalValue}
            onChangeText={setGoalValue}
          />
          <Button label="Add goal" onPress={handleAddGoal} />
        </Card>

        <Text style={styles.sectionTitle}>Your goals</Text>
        {goals.length === 0 ? (
          <EmptyState icon="flag-outline" title="No goals set" subtitle="Add one above to stay on track" />
        ) : (
          goals.map((g) => (
            <ListRow
              key={g.id}
              title={g.label}
              subtitle={`Target: ${g.target}`}
              onDelete={() => setPendingDeleteId(g.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={!!pendingDeleteId}
        title="Delete goal?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteGoal(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg, gap: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chipBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
});
