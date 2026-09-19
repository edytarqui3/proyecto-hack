import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { Solicitud, TabType } from '../types';
import { StatCard } from '../components/StatCard';
import { SelectModal } from '../components/SelectModal';
import { BDP_AGENCIES } from '../constants/agencies';

interface ListadoScreenProps {
  solicitudes: Solicitud[];
  onSelectSolicitud: (solicitud: Solicitud, targetTab: TabType) => void;
  onNewSolicitud: () => void;
}

const STATUS_OPTIONS = ['TODOS', 'EN_EVALUACION', 'APROBADO', 'RECHAZADO'];

export const ListadoScreen: React.FC<ListadoScreenProps> = ({
  solicitudes,
  onSelectSolicitud,
  onNewSolicitud,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');

  const [agencyModalVisible, setAgencyModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Filtrado reactivo
  const filteredList = useMemo(() => {
    return solicitudes.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        String(s.code).toLowerCase().includes(q) ||
        (s.applicantName && s.applicantName.toLowerCase().includes(q)) ||
        (s.applicantDocument && s.applicantDocument.toLowerCase().includes(q)) ||
        (s.agency && s.agency.toLowerCase().includes(q));

      const matchAgency = selectedAgency === 'TODAS' || s.agency === selectedAgency;
      const matchStatus =
        selectedStatus === 'TODOS' ||
        s.status === selectedStatus ||
        (selectedStatus === 'EN_EVALUACION' && s.status === 'IN_REVIEW') ||
        (selectedStatus === 'APROBADO' && s.status === 'APPROVED');

      return matchQuery && matchAgency && matchStatus;
    });
  }, [solicitudes, searchQuery, selectedAgency, selectedStatus]);

  // KPIs
  const stats = useMemo(() => {
    const totalCount = solicitudes.length;
    const totalAmount = solicitudes.reduce((sum, s) => sum + (Number(s.requestedAmount) || 0), 0);
    const inReviewCount = solicitudes.filter(
      (s) => s.status === 'EN_EVALUACION' || s.status === 'IN_REVIEW'
    ).length;
    const approvedCount = solicitudes.filter(
      (s) => s.status === 'APROBADO' || s.status === 'APPROVED'
    ).length;
    return { totalCount, totalAmount, inReviewCount, approvedCount };
  }, [solicitudes]);

  const agencyFilterOptions = useMemo(() => ['TODAS', ...BDP_AGENCIES], []);

  return (
    <View style={styles.container}>
      {/* Tarjetas KPI en fila scrolleable */}
      <View style={styles.kpiContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <StatCard
            title="Total Solicitudes"
            value={String(stats.totalCount)}
            subtitle="Expedientes en cartera"
            color={BDP_COLORS.navy}
          />
          <StatCard
            title="Cartera Solicitada"
            value={`Bs. ${stats.totalAmount.toLocaleString('es-BO')}`}
            subtitle="Monto total evaluado"
            color={BDP_COLORS.primary}
          />
          <StatCard
            title="En Evaluación"
            value={String(stats.inReviewCount)}
            subtitle="Oficiales de crédito"
            color={BDP_COLORS.amber}
          />
          <StatCard
            title="Aprobadas"
            value={String(stats.approvedCount)}
            subtitle="Dictamen favorable"
            color={BDP_COLORS.emerald}
          />
        </ScrollView>
      </View>

      {/* Barra de Búsqueda y Filtros */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código, C.I., cliente o agencia..."
          placeholderTextColor={BDP_COLORS.slate400}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />

        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setAgencyModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterBtnLabel} numberOfLines={1}>
              🏛️ {selectedAgency === 'TODAS' ? 'Agencias (Todas)' : selectedAgency.replace('AGENCIA ', '')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setStatusModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterBtnLabel}>
              🏷️ {selectedStatus === 'TODOS' ? 'Estados' : selectedStatus}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Solicitudes */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => String(item.id || item.code)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No se encontraron expedientes</Text>
            <Text style={styles.emptySubtitle}>Intenta con otros filtros o términos de búsqueda.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isApproved = item.status === 'APROBADO' || item.status === 'APPROVED';
          const cropNames = item.crops && item.crops.length > 0
            ? item.crops.map((c) => c.productName).join(', ')
            : 'Cultivos sin especificar';

          return (
            <View style={styles.card}>
              {/* Header de la tarjeta */}
              <View style={styles.cardHeader}>
                <View style={styles.codeRow}>
                  <Text style={styles.codePrefix}>EXPEDIENTE</Text>
                  <Text style={styles.codeNumber}>#{item.code}</Text>
                </View>
                <View style={[styles.statusBadge, isApproved ? styles.statusApproved : styles.statusReview]}>
                  <Text style={[styles.statusText, isApproved ? styles.statusTextApproved : styles.statusTextReview]}>
                    {isApproved ? 'APROBADO' : 'EN EVALUACIÓN'}
                  </Text>
                </View>
              </View>

              {/* Datos del Solicitante */}
              <Text style={styles.applicantName}>{item.applicantName}</Text>
              <Text style={styles.applicantDoc}>
                C.I. <Text style={styles.docHighlight}>{item.applicantDocument}</Text> • {item.agency}
              </Text>

              {/* Métricas de Financiamiento */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>MONTO SOLICITADO</Text>
                  <Text style={styles.metricValueAmount}>
                    Bs. {Number(item.requestedAmount).toLocaleString('es-BO')}
                  </Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>PLAZO Y PAGO</Text>
                  <Text style={styles.metricValue}>
                    {item.termMonths} meses • {item.paymentFrequency}
                  </Text>
                </View>
              </View>

              {/* Cultivos Registrados */}
              <View style={styles.cropsRow}>
                <Text style={styles.cropsLabel}>🌾 Cultivos:</Text>
                <Text style={styles.cropsText} numberOfLines={1}>
                  {cropNames}
                </Text>
              </View>

              {/* Acciones Rápidas */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => onSelectSolicitud(item, 'caratula')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnPrimaryText}>📂 Cargar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => onSelectSolicitud(item, 'hc_agricola')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText}>🌿 Costos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  onPress={() => onSelectSolicitud(item, 'resol_cred')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnSecondaryText}>📊 Dictamen</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Modales de Filtro */}
      <SelectModal
        visible={agencyModalVisible}
        title="Filtrar por Agencia BDP"
        options={agencyFilterOptions}
        selectedValue={selectedAgency}
        onSelect={setSelectedAgency}
        onClose={() => setAgencyModalVisible(false)}
      />

      <SelectModal
        visible={statusModalVisible}
        title="Filtrar por Estado"
        options={STATUS_OPTIONS}
        selectedValue={selectedStatus}
        onSelect={setSelectedStatus}
        onClose={() => setStatusModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BDP_COLORS.slate50,
  },
  kpiContainer: {
    backgroundColor: BDP_COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
  },
  kpiScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: BDP_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
    gap: 8,
  },
  searchInput: {
    backgroundColor: BDP_COLORS.slate100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: BDP_COLORS.slate900,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: BDP_COLORS.slate100,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
  },
  filterBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BDP_COLORS.slate700,
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  card: {
    backgroundColor: BDP_COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    shadowColor: BDP_COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codePrefix: {
    fontSize: 9,
    fontWeight: '800',
    color: BDP_COLORS.slate400,
    letterSpacing: 0.5,
  },
  codeNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: BDP_COLORS.navy,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusReview: {
    backgroundColor: BDP_COLORS.amberLight,
    borderWidth: 1,
    borderColor: BDP_COLORS.amberBorder,
  },
  statusApproved: {
    backgroundColor: BDP_COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: BDP_COLORS.emeraldBorder,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextReview: {
    color: '#92400E',
  },
  statusTextApproved: {
    color: '#065F46',
  },
  applicantName: {
    fontSize: 13,
    fontWeight: '800',
    color: BDP_COLORS.slate900,
  },
  applicantDoc: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
  },
  docHighlight: {
    fontWeight: '700',
    color: BDP_COLORS.slate800,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: BDP_COLORS.slate50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate100,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: BDP_COLORS.slate400,
    marginBottom: 2,
  },
  metricValueAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: BDP_COLORS.primary,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: BDP_COLORS.slate700,
  },
  cropsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cropsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: BDP_COLORS.slate500,
  },
  cropsText: {
    fontSize: 10,
    color: BDP_COLORS.slate700,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: BDP_COLORS.slate100,
  },
  actionBtnPrimary: {
    flex: 1.2,
    backgroundColor: BDP_COLORS.primary,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: BDP_COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: BDP_COLORS.lightBlue,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 114, 206, 0.2)',
  },
  actionBtnSecondaryText: {
    color: BDP_COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BDP_COLORS.slate700,
  },
  emptySubtitle: {
    fontSize: 11,
    color: BDP_COLORS.slate400,
    marginTop: 4,
    textAlign: 'center',
  },
});
