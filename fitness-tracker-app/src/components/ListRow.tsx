import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, radius, spacing, typography, AppColors } from '@/theme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ListRow({ title, subtitle, rightLabel, onPress, onEdit, onDelete }: ListRowProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}

      <View style={styles.actions}>
        {onEdit && (
          <Pressable onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    textWrap: { flex: 1 },
    title: { ...typography.h3, fontSize: 15, color: colors.textPrimary },
    subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    rightLabel: { ...typography.body, color: colors.primary, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: spacing.sm, marginLeft: spacing.xs },
    actionBtn: {
      width: 30,
      height: 30,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
