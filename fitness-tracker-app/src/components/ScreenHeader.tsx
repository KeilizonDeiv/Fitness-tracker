import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, radius, spacing, typography, AppColors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onAddPress?: () => void;
}

export function ScreenHeader({ title, subtitle, onAddPress }: ScreenHeaderProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onAddPress && (
        <Pressable style={styles.addBtn} onPress={onAddPress} hitSlop={8}>
          <Ionicons name="add" size={22} color={colors.bg} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
