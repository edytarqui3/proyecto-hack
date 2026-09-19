import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BDP_COLORS } from '../constants/theme';

interface ToastProps {
  type: 'success' | 'error' | 'saving' | null;
  message: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onDismiss }) => {
  if (!type) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: BDP_COLORS.emeraldLight,
          border: BDP_COLORS.emeraldBorder,
          text: '#064E3B',
          icon: '✅',
        };
      case 'saving':
        return {
          bg: BDP_COLORS.lightBlue,
          border: '#BFDBFE',
          text: '#1E3A8A',
          icon: '⏳',
        };
      case 'error':
      default:
        return {
          bg: BDP_COLORS.roseLight,
          border: BDP_COLORS.roseBorder,
          text: '#7F1D1D',
          icon: '⚠️',
        };
    }
  };

  const style = getStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.bg, borderColor: style.border }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{style.icon}</Text>
        <Text style={[styles.message, { color: style.text }]}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <Text style={[styles.closeText, { color: style.text }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  icon: {
    fontSize: 14,
  },
  message: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  closeText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
