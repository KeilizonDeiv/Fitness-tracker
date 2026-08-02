import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors, radius, AppColors } from '@/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const fillColor = color ?? colors.primary;
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: fillColor, height },
        ]}
      />
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: colors.bgElevated,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    fill: { borderRadius: radius.full },
  });
