import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, spacing, radius, typography, AppColors } from '@/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RootStackParamList } from '@/navigation/types';

import { useSettingsStore, LANGUAGES, ThemeMode } from '@/store/settingsStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useMetricsStore } from '@/store/metricsStore';
import { useWaterStore } from '@/store/waterStore';
import { useGoalsStore } from '@/store/goalsStore';
import { useProfileStore } from '@/store/profileStore';
import { wipeAllData } from '@/services/storageService';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const language = useSettingsStore((s) => s.settings.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const [confirmWipeVisible, setConfirmWipeVisible] = useState(false);
  const [wiping, setWiping] = useState(false);

  const handleWipe = async () => {
    setWiping(true);
    await wipeAllData();
    await Promise.all([
      useWorkoutStore.getState().hydrate(),
      useMetricsStore.getState().hydrate(),
      useWaterStore.getState().hydrate(),
      useGoalsStore.getState().hydrate(),
      useProfileStore.getState().hydrate(),
    ]);
    setWiping(false);
    setConfirmWipeVisible(false);
    // App.tsx reacts to hasOnboarded flipping to false and swaps to onboarding.
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card style={styles.card}>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((opt) => {
              const selected = themeMode === opt.mode;
              return (
                <Button
                  key={opt.mode}
                  label={opt.label}
                  variant={selected ? 'primary' : 'ghost'}
                  onPress={() => setThemeMode(opt.mode)}
                  icon={
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={selected ? colors.bg : colors.primary}
                    />
                  }
                  style={styles.optionBtn}
                />
              );
            })}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Language</Text>
        <Card style={styles.card}>
          {LANGUAGES.map((opt) => {
            const selected = language === opt.code;
            return (
              <Button
                key={opt.code}
                label={opt.label}
                variant={selected ? 'primary' : 'ghost'}
                onPress={() => setLanguage(opt.code)}
                icon={
                  selected ? (
                    <Ionicons name="checkmark" size={16} color={colors.bg} />
                  ) : undefined
                }
                style={styles.languageBtn}
              />
            );
          })}
          <Text style={styles.hint}>
            More languages translate the whole app over time — this sets your preference now.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Data</Text>
        <Card style={styles.card}>
          <Text style={styles.cardBody}>
            Permanently erase every workout, metric, water log, goal, and your profile from this
            device. This can't be undone.
          </Text>
          <Button
            label="Clear All Data"
            variant="danger"
            onPress={() => setConfirmWipeVisible(true)}
            icon={<Ionicons name="trash-outline" size={16} color={colors.bg} />}
          />
        </Card>

        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.card}>
          <Text style={styles.cardBody}>FitTrack v1.0.0</Text>
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={confirmWipeVisible}
        title="Clear all data?"
        message="This permanently deletes all your fitness data from this device. This cannot be undone."
        confirmLabel={wiping ? 'Clearing…' : 'Clear Everything'}
        onCancel={() => setConfirmWipeVisible(false)}
        onConfirm={handleWipe}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.xs },
    backBtn: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
    title: { ...typography.h1, color: colors.textPrimary },
    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    card: { marginBottom: spacing.lg, gap: spacing.sm },
    cardBody: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
    optionRow: { flexDirection: 'row', gap: spacing.xs },
    optionBtn: { flex: 1, paddingHorizontal: spacing.sm },
    languageBtn: { justifyContent: 'flex-start', paddingHorizontal: spacing.md },
    hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  });
