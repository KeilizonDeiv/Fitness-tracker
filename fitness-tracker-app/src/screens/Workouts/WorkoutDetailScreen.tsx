import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, radius, spacing, typography, AppColors } from '@/theme';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';

import { useWorkoutStore } from '@/store/workoutStore';
import { RootStackParamList } from '@/navigation/types';
import { formatDate } from '@/utils/date';
import { totalVolumeKg } from '@/utils/calculations';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const navigation = useNavigation<Nav>();
  const { workoutId } = useRoute<DetailRoute>().params;

  const workout = useWorkoutStore((s) => s.getWorkout(workoutId));
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);

  const [newExerciseName, setNewExerciseName] = useState('');
  const [setInputs, setSetInputs] = useState<Record<string, { reps: string; weight: string }>>({});
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState<string | null>(null);

  if (!workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState icon="alert-circle-outline" title="Workout not found" />
      </SafeAreaView>
    );
  }

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;
    await addExercise(workout.id, newExerciseName.trim());
    setNewExerciseName('');
  };

  const handleAddSet = async (exerciseId: string) => {
    const input = setInputs[exerciseId] || { reps: '', weight: '' };
    const reps = Number(input.reps) || 0;
    const weight = Number(input.weight) || 0;
    if (reps <= 0) return;
    await addSet(workout.id, exerciseId, reps, weight);
    setSetInputs((prev) => ({ ...prev, [exerciseId]: { reps: '', weight: '' } }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('WorkoutForm', { workoutId: workout.id })} hitSlop={12}>
          <Ionicons name="pencil" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.meta}>
          {formatDate(workout.date)} · {workout.durationMin} min · {workout.caloriesBurned} kcal ·{' '}
          {totalVolumeKg(workout)} kg volume
        </Text>
        {workout.notes ? <Text style={styles.notes}>"{workout.notes}"</Text> : null}

        <Text style={styles.sectionTitle}>Exercises</Text>

        {workout.exercises.length === 0 && (
          <EmptyState icon="list-outline" title="No exercises yet" subtitle="Add one below" />
        )}

        {workout.exercises.map((exercise) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Pressable onPress={() => setConfirmDeleteExercise(exercise.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </View>

            {exercise.sets.map((set, idx) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setText}>
                  Set {idx + 1}: {set.reps} reps × {set.weightKg} kg
                </Text>
                <Pressable onPress={() => removeSet(workout.id, exercise.id, set.id)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}

            <View style={styles.setInputRow}>
              <Input
                label="Reps"
                keyboardType="numeric"
                value={setInputs[exercise.id]?.reps ?? ''}
                onChangeText={(v) =>
                  setSetInputs((prev) => ({ ...prev, [exercise.id]: { ...prev[exercise.id], reps: v, weight: prev[exercise.id]?.weight ?? '' } }))
                }
                style={styles.smallInput}
              />
              <Input
                label="Weight (kg)"
                keyboardType="numeric"
                value={setInputs[exercise.id]?.weight ?? ''}
                onChangeText={(v) =>
                  setSetInputs((prev) => ({ ...prev, [exercise.id]: { ...prev[exercise.id], weight: v, reps: prev[exercise.id]?.reps ?? '' } }))
                }
                style={styles.smallInput}
              />
              <Pressable style={styles.addSetBtn} onPress={() => handleAddSet(exercise.id)}>
                <Ionicons name="add" size={20} color={colors.bg} />
              </Pressable>
            </View>
          </Card>
        ))}

        <View style={styles.newExerciseRow}>
          <Input
            label="Add exercise"
            placeholder="e.g. Bench Press"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            style={{ flex: 1 }}
          />
        </View>
        <Button label="Add exercise" variant="secondary" onPress={handleAddExercise} />
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmDeleteExercise}
        title="Remove exercise?"
        message="This will delete the exercise and all its sets."
        onCancel={() => setConfirmDeleteExercise(null)}
        onConfirm={() => {
          if (confirmDeleteExercise) removeExercise(workout.id, confirmDeleteExercise);
          setConfirmDeleteExercise(null);
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    title: { ...typography.h1, color: colors.textPrimary },
    meta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
    notes: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
    exerciseCard: { marginBottom: spacing.md, gap: spacing.sm },
    exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exerciseName: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
    setRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    setText: { ...typography.body, color: colors.textSecondary, fontSize: 13 },
    setInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', marginTop: spacing.sm },
    smallInput: { flex: 1, marginBottom: 0 },
    addSetBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    newExerciseRow: { marginTop: spacing.md },
  });
