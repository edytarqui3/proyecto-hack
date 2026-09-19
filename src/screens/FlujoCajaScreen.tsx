import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BDP_COLORS, MONTH_NAMES } from '../constants/theme';
import { Crop } from '../types';

interface FlujoCajaScreenProps {
  crops: Crop[];
  monthlyFamilyExpenses: number;
  monthlyOperatingExpenses: number;
  requestedAmount: number;
  onNavigateNext: () => void;
}

export const FlujoCajaScreen: React.FC<FlujoCajaScreenProps> = ({
  crops,
  monthlyFamilyExpenses = 2870,
  monthlyOperatingExpenses = 650,
  onNavigateNext,
}) => {
  // Proyección de 12 meses
  const monthlyProjection = useMemo(() => {
    let runningBalance = 0;
    return MONTH_NAMES.map((month, mIdx) => {
      // Ingresos agrícolas del mes
      const cropSales = crops.reduce((sum, c) => {
        const pct = c.salesMonthlyDistribution?.[mIdx] || 0;
        return sum + c.totalSales * pct;
      }, 0);

      // Costos agrícolas del mes
      const cropCosts = crops.reduce((sum, c) => {
        const pct = c.costsMonthlyDistribution?.[mIdx] || 0;
        return sum + c.totalProductionCost * pct;
      }, 0);

      const familyExp = monthlyFamilyExpenses;
      const opExp = monthlyOperatingExpenses;
      const totalExpenses = cropCosts + familyExp + opExp;
      const netCash = cropSales - totalExpenses;
      runningBalance += netCash;

      return {
        month,
        monthIndex: mIdx,
        cropSales,
        cropCosts,
        familyExp,
        opExp,
        totalExpenses,
        netCash,
        cumulativeBalance: runningBalance,
      };
    });
  }, [crops, monthlyFamilyExpenses, monthlyOperatingExpenses]);

  // Totales anuales
  const annualTotals = useMemo(() => {
    const totalSales = monthlyProjection.reduce((sum, m) => sum + m.cropSales, 0);
    const totalExpenses = monthlyProjection.reduce((sum, m) => sum + m.totalExpenses, 0);
    const netTotal = totalSales - totalExpenses;
    const minBalance = Math.min(...monthlyProjection.map((m) => m.cumulativeBalance));
    return { totalSales, totalExpenses, netTotal, minBalance };
  }, [monthlyProjection]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tarjeta de Resumen Anual Proyectado */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>PROYECCIÓN ANUAL DE FLUJO DE CAJA (12 MESES)</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>INGRESOS TOTALES</Text>
            <Text style={styles.summaryValueSales}>
              Bs. {annualTotals.totalSales.toLocaleString('es-BO')}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>EGRESOS TOTALES</Text>
            <Text style={styles.summaryValueExp}>
              Bs. {annualTotals.totalExpenses.toLocaleString('es-BO')}
            </Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>SUPERÁVIT NETO</Text>
            <Text style={[styles.summaryValueNet, annualTotals.netTotal < 0 && { color: BDP_COLORS.rose }]}>
              Bs. {annualTotals.netTotal.toLocaleString('es-BO')}
            </Text>
          </View>
        </View>
      </View>

      {/* Matriz Mensual Detallada */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📅 Flujo Mensualizado (Sep - Ago)</Text>
        <Text style={styles.sectionDesc}>
          Distribución de estacionalidad según ciclos de siembra, cosecha y ventas.
        </Text>

        <View style={styles.monthsContainer}>
          {monthlyProjection.map((m, idx) => {
            const isPositiveNet = m.netCash >= 0;
            const isPositiveCum = m.cumulativeBalance >= 0;

            return (
              <View key={idx} style={styles.monthRow}>
                {/* Mes Header */}
                <View style={styles.monthHeader}>
                  <View style={styles.monthBadge}>
                    <Text style={styles.monthBadgeText}>{m.month}</Text>
                  </View>
                  <Text style={[styles.netCashText, isPositiveNet ? styles.textGreen : styles.textRed]}>
                    {isPositiveNet ? '+' : ''}Bs. {Math.round(m.netCash).toLocaleString('es-BO')}
                  </Text>
                </View>

                {/* Desglose del Mes */}
                <View style={styles.monthDetailsGrid}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Ventas Agrícolas</Text>
                    <Text style={styles.detailValueGreen}>
                      Bs. {Math.round(m.cropSales).toLocaleString('es-BO')}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Costos Cultivo</Text>
                    <Text style={styles.detailValueRed}>
                      Bs. {Math.round(m.cropCosts).toLocaleString('es-BO')}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Gastos Fam./Op.</Text>
                    <Text style={styles.detailValue}>
                      Bs. {Math.round(m.familyExp + m.opExp).toLocaleString('es-BO')}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Saldo Acumulado</Text>
                    <Text style={[styles.detailValueCum, isPositiveCum ? styles.textNavy : styles.textRed]}>
                      Bs. {Math.round(m.cumulativeBalance).toLocaleString('es-BO')}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Botón de Navegación */}
      <TouchableOpacity style={styles.nextBtn} onPress={onNavigateNext} activeOpacity={0.8}>
        <Text style={styles.nextBtnText}>Continuar a Dictamen de Crédito ➡️</Text>
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
  summaryCard: {
    backgroundColor: BDP_COLORS.navy,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 8,
    color: BDP_COLORS.slate300,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryValueSales: {
    fontSize: 14,
    fontWeight: '900',
    color: '#38BDF8',
  },
  summaryValueExp: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCA5A5',
  },
  summaryValueNet: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4ADE80',
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
  sectionDesc: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
  },
  monthsContainer: {
    gap: 8,
  },
  monthRow: {
    backgroundColor: BDP_COLORS.slate50,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    gap: 6,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
    paddingBottom: 4,
  },
  monthBadge: {
    backgroundColor: BDP_COLORS.navy,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  monthBadgeText: {
    color: BDP_COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  netCashText: {
    fontSize: 12,
    fontWeight: '900',
  },
  monthDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 8,
    color: BDP_COLORS.slate400,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: '700',
    color: BDP_COLORS.slate700,
  },
  detailValueGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: BDP_COLORS.emerald,
  },
  detailValueRed: {
    fontSize: 10,
    fontWeight: '800',
    color: BDP_COLORS.rose,
  },
  detailValueCum: {
    fontSize: 10,
    fontWeight: '900',
  },
  textGreen: {
    color: BDP_COLORS.emerald,
  },
  textRed: {
    color: BDP_COLORS.rose,
  },
  textNavy: {
    color: BDP_COLORS.navy,
  },
  nextBtn: {
    backgroundColor: BDP_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtnText: {
    color: BDP_COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
