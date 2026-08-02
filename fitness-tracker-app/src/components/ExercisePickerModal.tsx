import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, radius, spacing, typography, AppColors } from '@/theme';
import { Input } from './Input';
import { Button } from './Button';
import { EXERCISE_PRESETS, ALL_CATEGORIES } from '@/data/exercisePresets';
import { WorkoutCategory } from '@/types';

interface ExercisePickerModalProps {
  visible: boolean;
  initialCategory: WorkoutCategory;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function ExercisePickerModal({
  visible,
  initialCategory,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [category, setCategory] = useState<WorkoutCategory>(initialCategory);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return EXERCISE_PRESETS[category];

    return ALL_CATEGORIES.flatMap((c) => EXERCISE_PRESETS[c]).filter((name) =>
      name.toLowerCase().includes(query)
    );
  }, [category, search]);

  const handleSelect = (name: string) => {
    onSelect(name);
    setSearch('');
    setCustomName('');
    onClose();
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    handleSelect(customName.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Input
          label="Search"
          placeholder="Search exercises…"
          value={search}
          onChangeText={setSearch}
        />

        {!search.trim() && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {ALL_CATEGORIES.map((c) => (
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
          </ScrollView>
        )}

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {results.map((name) => (
            <Pressable key={name} style={styles.row} onPress={() => handleSelect(name)}>
              <Text style={styles.rowText}>{name}</Text>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </Pressable>
          ))}
          {results.length === 0 && (
            <Text style={styles.empty}>No matches — add it as a custom exercise below.</Text>
          )}
        </ScrollView>

        <View style={styles.customRow}>
          <Input
            label="Custom exercise name"
            placeholder="e.g. Sled Push"
            value={customName}
            onChangeText={setCustomName}
            style={{ flex: 1 }}
          />
          <Button label="Add" onPress={handleAddCustom} style={styles.addBtn} />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, paddingTop: spacing.xxl },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: { ...typography.h2, color: colors.textPrimary },
    categoryRow: { marginBottom: spacing.sm, flexGrow: 0 },
    chip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
    chipTextActive: { color: colors.bg, fontWeight: '700' },
    list: { flex: 1 },
    listContent: { paddingBottom: spacing.md },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    rowText: { ...typography.body, color: colors.textPrimary },
    empty: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
    customRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
    addBtn: { marginBottom: spacing.md },
  });
