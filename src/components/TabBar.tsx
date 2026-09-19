import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  solicitudesCount: number;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'listado', label: 'Bandeja', icon: '📋' },
  { id: 'caratula', label: '1. Carátula', icon: '📝' },
  { id: 'datos_generales', label: '2. Datos Gen.', icon: '👤' },
  { id: 'hc_agricola', label: '3. Costos', icon: '🌿' },
  { id: 'flujo_caja', label: '4. Flujo Caja', icon: '📈' },
  { id: 'resol_cred', label: '5. Dictamen', icon: '⚖️' },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onSelectTab, solicitudesCount }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.id === 'listado' && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {solicitudesCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BDP_COLORS.navy,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
  },
  scrollContent: {
    paddingHorizontal: 10,
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    gap: 5,
  },
  tabButtonActive: {
    backgroundColor: BDP_COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  tabLabelActive: {
    color: BDP_COLORS.navy,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: BDP_COLORS.navy,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: BDP_COLORS.white,
  },
  badgeTextActive: {
    color: BDP_COLORS.white,
  },
});
