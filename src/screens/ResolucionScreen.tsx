import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { Crop, Officer, SolicitudConditions } from '../types';

interface ResolucionScreenProps {
  conditions: SolicitudConditions;
  crops: Crop[];
  cuotaEstimada: number;
  currentOfficer: Officer;
  onSaveToBackend: () => void;
  isSaving: boolean;
}

export const ResolucionScreen: React.FC<ResolucionScreenProps> = ({
  conditions,
  crops,
  cuotaEstimada,
  currentOfficer,
  onSaveToBackend,
  isSaving,
}) => {
  const [verdict, setVerdict] = useState<'APROBADO' | 'OBSERVADO' | 'RECHAZADO'>('APROBADO');
  const [officerNotes, setOfficerNotes] = useState(
    `Solicitante cuenta con experiencia productiva y activos de respaldo suficientes. Se recomienda la aprobación del microcrédito bajo condiciones preferenciales del BDP.`
  );

  // Cálculos financieros
  const totalVentas = crops.reduce((sum, c) => sum + Number(c.totalSales || 0), 0);
  const totalCostos = crops.reduce((sum, c) => sum + Number(c.totalProductionCost || 0), 0);
  const margenBruto = totalVentas - totalCostos;
  const mubPct = totalVentas > 0 ? (margenBruto / totalVentas) * 100 : 0;

  const cuotaAnual = cuotaEstimada * (conditions.paymentFrequency === 'SEMESTRAL' ? 2 : 12);
  const coberturaDeuda = cuotaAnual > 0 ? margenBruto / cuotaAnual : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Dictamen Ejecutivo */}
      <View style={styles.verdictCard}>
        <View style={styles.verdictHeader}>
          <Text style={styles.verdictTitle}>RESOLUCIÓN Y DICTAMEN DE RIESGO</Text>
          <View
            style={[
              styles.verdictBadge,
              verdict === 'APROBADO' && styles.badgeApproved,
              verdict === 'OBSERVADO' && styles.badgeObserved,
              verdict === 'RECHAZADO' && styles.badgeRejected,
            ]}
          >
            <Text
              style={[
                styles.verdictBadgeText,
                verdict === 'APROBADO' && styles.textApproved,
                verdict === 'OBSERVADO' && styles.textObserved,
                verdict === 'RECHAZADO' && styles.textRejected,
              ]}
            >
              {verdict}
            </Text>
          </View>
        </View>

        {/* Botones para cambiar dictamen */}
        <View style={styles.verdictButtonsRow}>
          <TouchableOpacity
            style={[styles.vBtn, verdict === 'APROBADO' && styles.vBtnApproved]}
            onPress={() => setVerdict('APROBADO')}
          >
            <Text style={[styles.vBtnText, verdict === 'APROBADO' && styles.vBtnTextActive]}>
              ✓ APROBADO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vBtn, verdict === 'OBSERVADO' && styles.vBtnObserved]}
            onPress={() => setVerdict('OBSERVADO')}
          >
            <Text style={[styles.vBtnText, verdict === 'OBSERVADO' && styles.vBtnTextActive]}>
              ⚠️ OBSERVADO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vBtn, verdict === 'RECHAZADO' && styles.vBtnRejected]}
            onPress={() => setVerdict('RECHAZADO')}
          >
            <Text style={[styles.vBtnText, verdict === 'RECHAZADO' && styles.vBtnTextActive]}>
              ✕ RECHAZADO
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Ratios e Indicadores Financieros */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📊 Indicadores Financieros y Capacidad</Text>

        <View style={styles.ratiosGrid}>
          <View style={styles.ratioBox}>
            <Text style={styles.ratioLabel}>MARGEN BRUTO (MUB)</Text>
            <Text style={styles.ratioValueGreen}>{mubPct.toFixed(1)}%</Text>
            <Text style={styles.ratioStatus}>Excelente rentabilidad</Text>
          </View>

          <View style={styles.ratioBox}>
            <Text style={styles.ratioLabel}>COBERTURA DEUDA (CA/SD)</Text>
            <Text style={styles.ratioValueBlue}>{coberturaDeuda.toFixed(2)}x</Text>
            <Text style={styles.ratioStatus}>
              {coberturaDeuda >= 1.3 ? '✓ Óptimo (> 1.3x)' : '⚠️ Bajo riesgo'}
            </Text>
          </View>

          <View style={styles.ratioBox}>
            <Text style={styles.ratioLabel}>CUOTA ESTIMADA</Text>
            <Text style={styles.ratioValue}>
              Bs. {Math.round(cuotaEstimada).toLocaleString('es-BO')}
            </Text>
            <Text style={styles.ratioStatus}>{conditions.paymentFrequency.toLowerCase()}</Text>
          </View>

          <View style={styles.ratioBox}>
            <Text style={styles.ratioLabel}>SUPERÁVIT ANUAL</Text>
            <Text style={styles.ratioValueGreen}>
              Bs. {Math.round(margenBruto - cuotaAnual).toLocaleString('es-BO')}
            </Text>
            <Text style={styles.ratioStatus}>Margen libre disponible</Text>
          </View>
        </View>
      </View>

      {/* 3. Condiciones Finales Recomendadas */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📝 Condiciones Aprobadas</Text>

        <View style={styles.summaryList}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Monto Recomendado:</Text>
            <Text style={styles.summaryItemValue}>
              Bs. {Number(conditions.requestedAmount).toLocaleString('es-BO')}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Plazo Aprobado:</Text>
            <Text style={styles.summaryItemValue}>{conditions.termMonths} meses</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Frecuencia de Amortización:</Text>
            <Text style={styles.summaryItemValue}>{conditions.paymentFrequency}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Tasa de Interés Pactada:</Text>
            <Text style={styles.summaryItemValue}>{conditions.interestRate}% anual</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Agencia Radicatoria:</Text>
            <Text style={styles.summaryItemValue}>{conditions.agency}</Text>
          </View>
        </View>
      </View>

      {/* 4. Conclusiones y Comentarios del Oficial */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>✍️ Informe del Oficial de Crédito</Text>
        <TextInput
          style={styles.notesInput}
          value={officerNotes}
          onChangeText={setOfficerNotes}
          multiline
          placeholder="Escribe las consideraciones técnicas, garantías y justificación..."
        />

        <View style={styles.officerSignatureBox}>
          <Text style={styles.signName}>{currentOfficer.name}</Text>
          <Text style={styles.signRole}>{currentOfficer.role} • {currentOfficer.agency}</Text>
          <Text style={styles.signDate}>Firma Digital y Validación BDP S.A.M.</Text>
        </View>
      </View>

      {/* Botón Guardar y Emitir Dictamen */}
      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={onSaveToBackend}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>
          {isSaving ? 'Guardando...' : '💾 Guardar y Emitir Dictamen en PostgreSQL'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BDP_COLORS.slate50,
  },
  content: {
    padding: 12,
    gap: 12,
    paddingBottom: 40,
  },
  verdictCard: {
    backgroundColor: BDP_COLORS.navy,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  verdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verdictTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  verdictBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeApproved: {
    backgroundColor: BDP_COLORS.emeraldLight,
    borderColor: BDP_COLORS.emeraldBorder,
  },
  badgeObserved: {
    backgroundColor: BDP_COLORS.amberLight,
    borderColor: BDP_COLORS.amberBorder,
  },
  badgeRejected: {
    backgroundColor: BDP_COLORS.roseLight,
    borderColor: BDP_COLORS.roseBorder,
  },
  verdictBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  textApproved: {
    color: '#065F46',
  },
  textObserved: {
    color: '#92400E',
  },
  textRejected: {
    color: '#991B1B',
  },
  verdictButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  vBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  vBtnApproved: {
    backgroundColor: BDP_COLORS.emerald,
  },
  vBtnObserved: {
    backgroundColor: BDP_COLORS.amber,
  },
  vBtnRejected: {
    backgroundColor: BDP_COLORS.rose,
  },
  vBtnText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '800',
  },
  vBtnTextActive: {
    color: BDP_COLORS.white,
    fontWeight: '900',
  },
  card: {
    backgroundColor: BDP_COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    shadowColor: BDP_COLORS.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: BDP_COLORS.navy,
  },
  ratiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratioBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: BDP_COLORS.slate50,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    gap: 2,
  },
  ratioLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: BDP_COLORS.slate400,
    textTransform: 'uppercase',
  },
  ratioValue: {
    fontSize: 14,
    fontWeight: '900',
    color: BDP_COLORS.slate900,
  },
  ratioValueGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: BDP_COLORS.emerald,
  },
  ratioValueBlue: {
    fontSize: 14,
    fontWeight: '900',
    color: BDP_COLORS.primary,
  },
  ratioStatus: {
    fontSize: 9,
    color: BDP_COLORS.slate500,
  },
  summaryList: {
    gap: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate100,
  },
  summaryItemLabel: {
    fontSize: 11,
    color: BDP_COLORS.slate600,
  },
  summaryItemValue: {
    fontSize: 11,
    fontWeight: '800',
    color: BDP_COLORS.slate900,
  },
  notesInput: {
    backgroundColor: BDP_COLORS.slate50,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: BDP_COLORS.slate900,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  officerSignatureBox: {
    backgroundColor: BDP_COLORS.lightBlue,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 114, 206, 0.2)',
    marginTop: 4,
  },
  signName: {
    fontSize: 12,
    fontWeight: '900',
    color: BDP_COLORS.navy,
  },
  signRole: {
    fontSize: 10,
    color: BDP_COLORS.slate600,
    marginTop: 1,
  },
  signDate: {
    fontSize: 9,
    color: BDP_COLORS.primary,
    fontWeight: '700',
    marginTop: 3,
  },
  saveBtn: {
    backgroundColor: BDP_COLORS.emerald,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: BDP_COLORS.emerald,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: BDP_COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
});
