import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing } from '@/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListRow } from '@/components/ListRow';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useWorkoutStore } from '@/store/workoutStore';
import { RootStackParamList } from '@/navigation/types';
import { formatDate } from '@/utils/date';
import { totalSets } from '@/utils/calculations';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WorkoutListScreen() {
  const navigation = useNavigation<Nav>();
  const workouts = useWorkoutStore((s) => s.workouts);
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader
          title="Workouts"
          subtitle={`${workouts.length} logged`}
          onAddPress={() => navigation.navigate('WorkoutForm')}
        />

        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              icon="barbell-outline"
              title="No workouts yet"
              subtitle="Tap the + button to log your first workout"
            />
          }
          renderItem={({ item }) => (
            <ListRow
              title={item.name}
              subtitle={`${formatDate(item.date)} · ${item.durationMin} min · ${totalSets(item)} sets`}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
              onEdit={() => navigation.navigate('WorkoutForm', { workoutId: item.id })}
              onDelete={() => setPendingDeleteId(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      </View>

      <ConfirmDialog
        visible={!!pendingDeleteId}
        title="Delete workout?"
        message="This will permanently remove this workout and its logged exercises."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteWorkout(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
});
