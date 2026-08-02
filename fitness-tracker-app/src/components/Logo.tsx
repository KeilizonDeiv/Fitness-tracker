import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, spacing, typography, AppColors } from '@/theme';

interface LogoProps {
  size?: number;
  showName?: boolean;
}

export function Logo({ size = 96, showName = false }: LogoProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Ionicons name="barbell" size={size * 0.55} color={colors.bg} />
      </View>
      {showName ? <Text style={styles.name}>FitTrack</Text> : null}
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { alignItems: 'center' },
    badge: {
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      ...typography.h1,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      letterSpacing: 0.5,
    },
  });
