import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, spacing, typography, radius, AppColors } from '@/theme';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useProfileStore } from '@/store/profileStore';
import { useGoalsStore } from '@/store/goalsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { GoalType } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import {
  displayHeight,
  displayWeight,
  heightUnitLabel,
  parseHeightToCm,
  parseWeightToKg,
  weightUnitLabel,
} from '@/utils/units';

export function ProfileScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);

  const units = useSettingsStore((s) => s.settings.units);
  const heightUnit = heightUnitLabel(units);
  const weightUnit = weightUnitLabel(units);

  const GOAL_TYPES: { type: GoalType; label: string }[] = [
    { type: 'weight_target', label: `Target weight (${weightUnit})` },
    { type: 'weekly_workouts', label: 'Workouts per week' },
    { type: 'daily_water_ml', label: 'Daily water (ml)' },
  ];

  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(String(displayHeight(profile.heightCm, units)));
  const [goalType, setGoalType] = useState<GoalType>('weight_target');
  const [goalValue, setGoalValue] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Keep the height field in sync if the unit system changes while this screen is mounted.
  useEffect(() => {
    setHeight(String(displayHeight(profile.heightCm, units)));
  }, [units]);

  const handleSaveProfile = () => {
    const heightCm = parseHeightToCm(height, units) || profile.heightCm;
    updateProfile({ name: name.trim() || profile.name, heightCm });
  };

  const handleAddGoal = async () => {
    const rawValue = Number(goalValue);
    if (!rawValue) return;
    const target = goalType === 'weight_target' ? parseWeightToKg(goalValue, units) : rawValue;
    const meta = GOAL_TYPES.find((g) => g.type === goalType)!;
    await addGoal({ type: goalType, label: meta.label, target });
    setGoalValue('');
  };

  const formatGoalTarget = (goal: { type: GoalType; target: number }) => {
    if (goal.type === 'weight_target') return `Target: ${displayWeight(goal.target, units)} ${weightUnit}`;
    if (goal.type === 'daily_water_ml') return `Target: ${goal.target} ml`;
    return `Target: ${goal.target}/week`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Profile</Text>
          <Pressable
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Your details</Text>
          <Input label="Name" value={name} onChangeText={setName} onEndEditing={handleSaveProfile} />
          <Input
            label={`Height (${heightUnit})`}
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
              subtitle={formatGoalTarget(g)}
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

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: { marginBottom: spacing.lg, gap: spacing.sm },
    cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
    chipBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  });
