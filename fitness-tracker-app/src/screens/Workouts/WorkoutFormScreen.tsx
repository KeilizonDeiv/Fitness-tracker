import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, radius, spacing, typography } from '@/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

import { useWorkoutStore } from '@/store/workoutStore';
import { RootStackParamList } from '@/navigation/types';
import { WorkoutCategory } from '@/types';
import { todayISO } from '@/utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FormRoute = RouteProp<RootStackParamList, 'WorkoutForm'>;

const CATEGORIES: WorkoutCategory[] = ['strength', 'cardio', 'flexibility', 'sports', 'other'];

export function WorkoutFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<FormRoute>();
  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;

  const existing = useWorkoutStore((s) => (workoutId ? s.getWorkout(workoutId) : undefined));
  const addWorkout = useWorkoutStore((s) => s.addWorkout);
  const updateWorkout = useWorkoutStore((s) => s.updateWorkout);

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<WorkoutCategory>(existing?.category ?? 'strength');
  const [durationMin, setDurationMin] = useState(existing?.durationMin?.toString() ?? '30');
  const [caloriesBurned, setCaloriesBurned] = useState(existing?.caloriesBurned?.toString() ?? '200');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string | undefined>();

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Workout name is required');
      return;
    }
    const payload = {
      name: name.trim(),
      category,
      date: existing?.date ?? todayISO(),
      durationMin: Number(durationMin) || 0,
      caloriesBurned: Number(caloriesBurned) || 0,
      notes: notes.trim() || undefined,
    };

    if (isEditing && workoutId) {
      await updateWorkout(workoutId, payload);
      navigation.goBack();
    } else {
      const created = await addWorkout(payload);
      navigation.replace('WorkoutDetail', { workoutId: created.id });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{isEditing ? 'Edit Workout' : 'New Workout'}</Text>

        <Input
          label="Workout name"
          placeholder="e.g. Push Day, Morning Run"
          value={name}
          onChangeText={setName}
          error={error}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Duration (minutes)"
          keyboardType="numeric"
          value={durationMin}
          onChangeText={setDurationMin}
        />
        <Input
          label="Calories burned (est.)"
          keyboardType="numeric"
          value={caloriesBurned}
          onChangeText={setCaloriesBurned}
        />
        <Input
          label="Notes (optional)"
          placeholder="How did it feel?"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />

        <View style={styles.actions}>
          <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
          <Button
            label={isEditing ? 'Save changes' : 'Create workout'}
            onPress={handleSave}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: colors.bg, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
