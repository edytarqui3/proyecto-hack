import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { SolicitudConditions, Client } from '../types';
import { SelectModal } from '../components/SelectModal';
import { BDP_AGENCIES } from '../constants/agencies';

interface CaratulaScreenProps {
  solicitudNumero: number | string;
  conditions: SolicitudConditions;
  onChangeConditions: (newConditions: SolicitudConditions) => void;
  searchCI: string;
  onSearchCI: (ci: string) => void;
  clientFoundStatus: 'EXISTENTE' | 'NUEVO';
  matchedClient: Client | null;
  cuotaEstimada: number;
  onSaveToBackend: () => void;
  isSaving: boolean;
  onNavigateNext: () => void;
}

const FREQUENCIES = ['SEMESTRAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'ANUAL', 'AL_VENCIMIENTO'];
const AMORTIZATION_TYPES = ['FRANCES', 'CONSTANTE'];

export const CaratulaScreen: React.FC<CaratulaScreenProps> = ({
  solicitudNumero,
  conditions,
  onChangeConditions,
  searchCI,
  onSearchCI,
  clientFoundStatus,
  matchedClient,
  cuotaEstimada,
  onSaveToBackend,
  isSaving,
  onNavigateNext,
}) => {
  const [ciInput, setCiInput] = useState(searchCI);
  const [agencyModalVisible, setAgencyModalVisible] = useState(false);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [amortModalVisible, setAmortModalVisible] = useState(false);

  const handleCiSearch = () => {
    onSearchCI(ciInput.trim());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta de Encabezado: Nº Solicitud y Agencia */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardSubTitle}>CARÁTULA DE EVALUACIÓN</Text>
            <Text style={styles.cardTitle}>Solicitud Nº {solicitudNumero}</Text>
          </View>
          <View style={styles.badgeReview}>
            <Text style={styles.badgeReviewText}>EN EVALUACIÓN</Text>
          </View>
        </View>

        {/* Selector de Agencia */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>AGENCIA BDP (38 AGENCIAS)</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setAgencyModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectBtnText}>🏛️ {conditions.agency}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Fecha de Visita */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>FECHA DE VISITA / EVALUACIÓN</Text>
          <TextInput
            style={styles.input}
            value={conditions.visitDate}
            onChangeText={(val) => onChangeConditions({ ...conditions, visitDate: val })}
            placeholder="AAAA-MM-DD"
          />
        </View>
      </View>

      {/* Búsqueda de Cliente por Cédula de Identidad (CI) */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>🔍 Búsqueda de Cliente por C.I.</Text>
        <Text style={styles.sectionDesc}>
          Ingresa la Cédula de Identidad para vincular un cliente existente o registrar uno nuevo.
        </Text>

        <View style={styles.ciSearchRow}>
          <TextInput
            style={styles.ciInput}
            placeholder="Número de C.I. (ej. 5021899, 4582190)"
            placeholderTextColor={BDP_COLORS.slate400}
            value={ciInput}
            onChangeText={setCiInput}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.ciSearchBtn}
            onPress={handleCiSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.ciSearchBtnText}>Buscar CI</Text>
          </TouchableOpacity>
        </View>

        {/* Estado de Coincidencia */}
        <View
          style={[
            styles.clientMatchBox,
            clientFoundStatus === 'EXISTENTE' ? styles.clientFound : styles.clientNew,
          ]}
        >
          <View style={styles.clientMatchHeader}>
            <Text style={styles.clientMatchBadge}>
              {clientFoundStatus === 'EXISTENTE' ? '✓ CLIENTE EN BASE DE DATOS' : '⚡ NUEVO CLIENTE'}
            </Text>
            {matchedClient && (
              <Text style={styles.clientRatingBadge}>{matchedClient.infocredRating}</Text>
            )}
          </View>

          {matchedClient ? (
            <View style={styles.clientDetails}>
              <Text style={styles.clientFullName}>
                {matchedClient.firstNames} {matchedClient.firstSurname} {matchedClient.secondSurname}{' '}
                {matchedClient.marriedSurname || ''}
              </Text>
              <Text style={styles.clientLocation}>
                📍 {matchedClient.municipality}, {matchedClient.department} • {matchedClient.locality}
              </Text>
              <Text style={styles.clientActivity}>
                🌾 {matchedClient.economicActivityCaedec}
              </Text>
              <Text style={styles.clientSeniority}>
                Antigüedad en actividad: {Math.round(matchedClient.activityExperienceMonths / 12)} años
              </Text>
            </View>
          ) : (
            <Text style={styles.clientNewNotice}>
              No se encontró historial previo para el C.I. {ciInput}. Puedes completar los datos en la pestaña
              "2. Datos Generales".
            </Text>
          )}
        </View>
      </View>

      {/* Parámetros de la Solicitud de Crédito */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>💰 Condiciones del Microcrédito</Text>

        {/* Monto y Plazo */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1.2 }]}>
            <Text style={styles.fieldLabel}>MONTO SOLICITADO (BS.)</Text>
            <TextInput
              style={styles.inputAmount}
              value={String(conditions.requestedAmount)}
              onChangeText={(val) =>
                onChangeConditions({
                  ...conditions,
                  requestedAmount: Number(val.replace(/[^0-9.]/g, '')) || 0,
                })
              }
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 0.8 }]}>
            <Text style={styles.fieldLabel}>PLAZO (MESES)</Text>
            <TextInput
              style={styles.input}
              value={String(conditions.termMonths)}
              onChangeText={(val) =>
                onChangeConditions({
                  ...conditions,
                  termMonths: Number(val.replace(/[^0-9]/g, '')) || 12,
                })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Frecuencia de Pago y Tasa */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1.2 }]}>
            <Text style={styles.fieldLabel}>FRECUENCIA DE PAGO</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setFrequencyModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectBtnText}>{conditions.paymentFrequency}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.fieldGroup, { flex: 0.8 }]}>
            <Text style={styles.fieldLabel}>TASA ANUAL (%)</Text>
            <TextInput
              style={styles.input}
              value={String(conditions.interestRate)}
              onChangeText={(val) =>
                onChangeConditions({
                  ...conditions,
                  interestRate: Number(val.replace(/[^0-9.]/g, '')) || 11,
                })
              }
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Destino y Amortización */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DESTINO DEL CRÉDITO</Text>
          <TextInput
            style={styles.input}
            value={conditions.creditDestination}
            onChangeText={(val) => onChangeConditions({ ...conditions, creditDestination: val })}
            placeholder="Capital de Operaciones y Cosecha"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>TIPO DE AMORTIZACIÓN</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setAmortModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectBtnText}>{conditions.amortizationType}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Cuota Calculada */}
        <View style={styles.cuotaBox}>
          <View>
            <Text style={styles.cuotaLabel}>CUOTA ESTIMADA REFERENCIAL</Text>
            <Text style={styles.cuotaFrequency}>
              Periodicidad: {conditions.paymentFrequency.toLowerCase()}
            </Text>
          </View>
          <Text style={styles.cuotaValue}>
            Bs. {cuotaEstimada.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={onSaveToBackend}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color={BDP_COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>💾 Guardar Solicitud en Servidor</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={onNavigateNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>Continuar a Datos Generales ➡️</Text>
        </TouchableOpacity>
      </View>

      {/* Modales de Selección */}
      <SelectModal
        visible={agencyModalVisible}
        title="Seleccionar Agencia BDP"
        options={BDP_AGENCIES}
        selectedValue={conditions.agency}
        onSelect={(agency) => onChangeConditions({ ...conditions, agency })}
        onClose={() => setAgencyModalVisible(false)}
      />

      <SelectModal
        visible={frequencyModalVisible}
        title="Frecuencia de Pago"
        options={FREQUENCIES}
        selectedValue={conditions.paymentFrequency}
        onSelect={(freq) => onChangeConditions({ ...conditions, paymentFrequency: freq })}
        onClose={() => setFrequencyModalVisible(false)}
      />

      <SelectModal
        visible={amortModalVisible}
        title="Tipo de Amortización"
        options={AMORTIZATION_TYPES}
        selectedValue={conditions.amortizationType}
        onSelect={(type) => onChangeConditions({ ...conditions, amortizationType: type })}
        onClose={() => setAmortModalVisible(false)}
      />
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate100,
    paddingBottom: 8,
  },
  cardSubTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: BDP_COLORS.slate400,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: BDP_COLORS.navy,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badgeReview: {
    backgroundColor: BDP_COLORS.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BDP_COLORS.amberBorder,
  },
  badgeReviewText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: BDP_COLORS.navy,
  },
  sectionDesc: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
  },
  ciSearchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ciInput: {
    flex: 1,
    backgroundColor: BDP_COLORS.slate50,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: BDP_COLORS.slate900,
    fontWeight: '700',
  },
  ciSearchBtn: {
    backgroundColor: BDP_COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ciSearchBtnText: {
    color: BDP_COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  clientMatchBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  clientFound: {
    backgroundColor: BDP_COLORS.emeraldLight,
    borderColor: BDP_COLORS.emeraldBorder,
  },
  clientNew: {
    backgroundColor: BDP_COLORS.amberLight,
    borderColor: BDP_COLORS.amberBorder,
  },
  clientMatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientMatchBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: BDP_COLORS.slate700,
  },
  clientRatingBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    backgroundColor: BDP_COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  clientDetails: {
    gap: 3,
  },
  clientFullName: {
    fontSize: 13,
    fontWeight: '900',
    color: BDP_COLORS.slate900,
  },
  clientLocation: {
    fontSize: 11,
    color: BDP_COLORS.slate600,
  },
  clientActivity: {
    fontSize: 11,
    color: BDP_COLORS.slate700,
    fontWeight: '600',
  },
  clientSeniority: {
    fontSize: 10,
    color: BDP_COLORS.slate500,
  },
  clientNewNotice: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: BDP_COLORS.slate500,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: BDP_COLORS.slate50,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: BDP_COLORS.slate900,
  },
  inputAmount: {
    backgroundColor: BDP_COLORS.lightBlue,
    borderWidth: 1.5,
    borderColor: BDP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 15,
    fontWeight: '900',
    color: BDP_COLORS.navy,
  },
  selectBtn: {
    backgroundColor: BDP_COLORS.slate50,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: BDP_COLORS.slate800,
  },
  selectArrow: {
    fontSize: 9,
    color: BDP_COLORS.slate400,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  cuotaBox: {
    backgroundColor: BDP_COLORS.navy,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cuotaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
  },
  cuotaFrequency: {
    fontSize: 9,
    color: BDP_COLORS.slate300,
  },
  cuotaValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE047',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: BDP_COLORS.emerald,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: BDP_COLORS.emerald,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: BDP_COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  nextBtn: {
    backgroundColor: BDP_COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextBtnText: {
    color: BDP_COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
