import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useColors, radius, spacing, typography, AppColors } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
}: ButtonProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const variantBg: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.bgElevated,
    danger: colors.danger,
    ghost: 'transparent',
  };

  const variantText: Record<Variant, string> = {
    primary: colors.bg,
    secondary: colors.textPrimary,
    danger: colors.bg,
    ghost: colors.primary,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: variantBg[variant] },
        variant === 'ghost' && styles.ghostBorder,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantText[variant]} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: variantText[variant] }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
    },
    ghostBorder: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      ...typography.h3,
      fontSize: 15,
    },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
  });
