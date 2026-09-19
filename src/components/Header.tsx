import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { Officer, TabType } from '../types';

interface HeaderProps {
  currentOfficer: Officer;
  onPressOfficer: () => void;
  onPressNewSolicitud: () => void;
  activeTab: TabType;
  solicitudNumero: number | string;
  solicitudAgency: string;
  totalSolicitudes: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentOfficer,
  onPressOfficer,
  onPressNewSolicitud,
  activeTab,
  solicitudNumero,
  solicitudAgency,
  totalSolicitudes,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Barra Principal Institucional */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>BDP</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>BDP S.A.M.</Text>
              <View style={styles.microBadge}>
                <Text style={styles.microBadgeText}>&lt; Bs. 140.000</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Evaluación de Riesgo Crediticio</Text>
          </View>
        </View>

        {/* Oficial de Crédito Activo y Botón Nueva Solicitud */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.newButton}
            onPress={onPressNewSolicitud}
            activeOpacity={0.8}
          >
            <Text style={styles.newButtonText}>+ Nueva</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.officerButton}
            onPress={onPressOfficer}
            activeOpacity={0.8}
          >
            <Image source={{ uri: currentOfficer.avatar }} style={styles.officerAvatar} />
            <View style={styles.officerInfo}>
              <Text style={styles.officerName} numberOfLines={1}>
                {currentOfficer.name.replace('Lic. ', '').replace('Ing. ', '').replace('Dr. ', '')}
              </Text>
              <Text style={styles.officerRole} numberOfLines={1}>
                {currentOfficer.agency.replace('AGENCIA ', '')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-banner Informativo */}
      <View style={styles.subBanner}>
        {activeTab === 'listado' ? (
          <View style={styles.bannerContent}>
            <View style={styles.pulseDot} />
            <Text style={styles.bannerText}>
              Bandeja de Expedientes: <Text style={styles.bannerBold}>{totalSolicitudes} registrados</Text>
            </Text>
          </View>
        ) : (
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>
              Solicitud Activa: <Text style={styles.bannerCode}>#{solicitudNumero}</Text>
            </Text>
            <Text style={styles.bannerSeparator}>•</Text>
            <Text style={styles.bannerSubtext} numberOfLines={1}>
              {solicitudAgency.replace('AGENCIA ', '')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: BDP_COLORS.navy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: BDP_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: BDP_COLORS.navy,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: BDP_COLORS.white,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  microBadge: {
    backgroundColor: 'rgba(0, 163, 224, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 224, 0.4)',
  },
  microBadgeText: {
    color: '#A2EBFF',
    fontSize: 9,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: '#93C5FD',
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newButton: {
    backgroundColor: BDP_COLORS.emerald,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newButtonText: {
    color: BDP_COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  officerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
    maxWidth: 130,
  },
  officerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  officerInfo: {
    flexShrink: 1,
  },
  officerName: {
    color: BDP_COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  officerRole: {
    color: BDP_COLORS.slate300,
    fontSize: 9,
  },
  subBanner: {
    backgroundColor: BDP_COLORS.navyDark,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BDP_COLORS.emerald,
  },
  bannerText: {
    color: '#93C5FD',
    fontSize: 11,
  },
  bannerBold: {
    color: BDP_COLORS.white,
    fontWeight: '800',
  },
  bannerCode: {
    color: '#FDE047',
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  bannerSeparator: {
    color: BDP_COLORS.slate500,
    fontSize: 11,
  },
  bannerSubtext: {
    color: BDP_COLORS.slate300,
    fontSize: 11,
    flexShrink: 1,
  },
});
