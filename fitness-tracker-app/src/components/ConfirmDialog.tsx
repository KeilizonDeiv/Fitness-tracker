import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { useColors, radius, spacing, typography, AppColors } from '@/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onCancel} style={styles.flexBtn} />
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} style={styles.flexBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    dialog: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
    message: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm },
    flexBtn: { flex: 1 },
  });
