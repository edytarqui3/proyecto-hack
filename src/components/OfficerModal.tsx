import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { DEMO_OFFICERS } from '../constants/officers';
import { Officer } from '../types';

interface OfficerModalProps {
  visible: boolean;
  currentOfficer: Officer;
  onSelectOfficer: (officer: Officer) => void;
  onClose: () => void;
}

export const OfficerModal: React.FC<OfficerModalProps> = ({
  visible,
  currentOfficer,
  onSelectOfficer,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Oficiales de Crédito BDP</Text>
              <Text style={styles.subtitle}>Selecciona el perfil activo para evaluar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {DEMO_OFFICERS.map((officer) => {
              const isSelected = officer.id === currentOfficer.id;
              return (
                <TouchableOpacity
                  key={officer.id}
                  style={[styles.officerItem, isSelected && styles.officerItemSelected]}
                  onPress={() => {
                    onSelectOfficer(officer);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: officer.avatar }} style={styles.avatar} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{officer.name}</Text>
                      <View
                        style={[
                          styles.roleBadge,
                          officer.role === 'SUPERVISOR' && styles.roleBadgeSupervisor,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            officer.role === 'SUPERVISOR' && styles.roleBadgeTextSupervisor,
                          ]}
                        >
                          {officer.role === 'SUPERVISOR' ? 'Supervisor' : 'Oficial'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.agency}>{officer.agency}</Text>
                    <Text style={styles.region}>{officer.region}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Activo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: BDP_COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
    backgroundColor: BDP_COLORS.slate50,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: BDP_COLORS.navy,
  },
  subtitle: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: BDP_COLORS.slate200,
  },
  closeBtnText: {
    fontSize: 13,
    color: BDP_COLORS.slate700,
    fontWeight: '700',
  },
  list: {
    padding: 10,
    gap: 8,
  },
  officerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    backgroundColor: BDP_COLORS.white,
    gap: 10,
  },
  officerItemSelected: {
    borderColor: BDP_COLORS.primary,
    backgroundColor: BDP_COLORS.lightBlue,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BDP_COLORS.slate300,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: BDP_COLORS.slate900,
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 114, 206, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeSupervisor: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  roleBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: BDP_COLORS.primary,
  },
  roleBadgeTextSupervisor: {
    color: BDP_COLORS.amber,
  },
  agency: {
    fontSize: 10,
    fontWeight: '700',
    color: BDP_COLORS.slate600,
    marginTop: 2,
  },
  region: {
    fontSize: 9,
    color: BDP_COLORS.slate400,
  },
  activePill: {
    backgroundColor: BDP_COLORS.emerald,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: BDP_COLORS.white,
  },
});
