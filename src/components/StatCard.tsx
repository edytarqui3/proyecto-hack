import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BDP_COLORS } from '../constants/theme';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = BDP_COLORS.primary,
  bgColor = BDP_COLORS.white,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    shadowColor: BDP_COLORS.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: BDP_COLORS.slate500,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 9,
    color: BDP_COLORS.slate400,
    marginTop: 2,
  },
});
