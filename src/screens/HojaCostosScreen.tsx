import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { BDP_COLORS } from '../constants/theme';
import { Crop, CostItem } from '../types';

interface HojaCostosScreenProps {
  crops: Crop[];
  onChangeCrops: (newCrops: Crop[]) => void;
  onNavigateNext: () => void;
}

export const HojaCostosScreen: React.FC<HojaCostosScreenProps> = ({
  crops,
  onChangeCrops,
  onNavigateNext,
}) => {
  const [activeCropIndex, setActiveCropIndex] = useState(0);

  const selectedCrop = crops[activeCropIndex] || crops[0];

  // Actualizar parámetro del cultivo
  const handleUpdateCrop = (field: keyof Crop, val: any) => {
    const updated = [...crops];
    const c = { ...updated[activeCropIndex], [field]: val };

    const sup = Number(c.cultivatedAreaHectares) || 1;
    const rto = Number(c.yieldPerHectare) || 0;
    const merma = Number(c.harvestWasteOrConsumption) || 0;
    c.totalYield = Math.max(0, rto * sup - merma);

    const ciclos = Number(c.cyclesPerYear) || 1;
    const precio = Number(c.salePrice) || 0;
    c.totalSales = c.totalYield * ciclos * precio;

    const costos = Number(c.totalProductionCost) || 0;
    c.grossMarginPercentage = c.totalSales > 0 ? (c.totalSales - costos) / c.totalSales : 0;

    updated[activeCropIndex] = c;
    onChangeCrops(updated);
  };

  // Actualizar un ítem de costo
  const handleUpdateCostItem = (itemIdx: number, field: keyof CostItem, val: any) => {
    const updated = [...crops];
    const crop = { ...updated[activeCropIndex] };
    const items = [...crop.costItems];
    const item = { ...items[itemIdx], [field]: val };

    if (field === 'quantity' || field === 'unitCost') {
      const q = Number(field === 'quantity' ? val : item.quantity) || 0;
      const uc = Number(field === 'unitCost' ? val : item.unitCost) || 0;
      item.totalCost = q * uc;
    }
    items[itemIdx] = item;
    crop.costItems = items;

    crop.totalProductionCost = items.reduce((sum, it) => sum + (Number(it.totalCost) || 0), 0);
    crop.grossMarginPercentage =
      crop.totalSales > 0 ? (crop.totalSales - crop.totalProductionCost) / crop.totalSales : 0;

    updated[activeCropIndex] = crop;
    onChangeCrops(updated);
  };

  // Agregar nuevo cultivo
  const handleAddCrop = () => {
    const num = crops.length + 1;
    const newCrop: Crop = {
      cropIndex: num,
      productName: `CULTIVO PRODUCTO ${num}`,
      yieldUnit: 'QUINTAL',
      cyclesPerYear: 1,
      cultivatedAreaHectares: 1,
      harvestWasteOrConsumption: 0,
      yieldPerHectare: 100,
      totalYield: 100,
      salePrice: 180,
      totalProductionCost: 9500,
      totalSales: 18000,
      grossMarginPercentage: 0.4722,
      salesMonthlyDistribution: [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0, 0, 0, 0],
      costsMonthlyDistribution: [0.2, 0.3, 0.3, 0.2, 0, 0, 0, 0, 0, 0, 0, 0],
      costItems: [
        { itemIndex: 1, activityName: 'Preparación de Suelo', costCategory: 'Mantenimiento', unit: 'HORA', quantity: 4, unitCost: 180, totalCost: 720 },
        { itemIndex: 2, activityName: 'Siembra', costCategory: 'Siembra', unit: 'JORNAL', quantity: 10, unitCost: 100, totalCost: 1000 },
        { itemIndex: 3, activityName: 'Semilla Certificada', costCategory: 'Insumos', unit: 'QUINTAL', quantity: 10, unitCost: 350, totalCost: 3500 },
        { itemIndex: 4, activityName: 'Abono y Fitosanitarios', costCategory: 'Insumos', unit: 'GLOBAL', quantity: 1, unitCost: 2000, totalCost: 2000 },
        { itemIndex: 5, activityName: 'Cosecha y Acopio', costCategory: 'Cosecha', unit: 'JORNAL', quantity: 15, unitCost: 100, totalCost: 1500 },
        { itemIndex: 6, activityName: 'Transporte a Mercado', costCategory: 'Post Cosecha', unit: 'GLOBAL', quantity: 1, unitCost: 780, totalCost: 780 },
      ],
    };
    onChangeCrops([...crops, newCrop]);
    setActiveCropIndex(crops.length);
  };

  // Totales consolidados de todos los cultivos
  const consolidated = useMemo(() => {
    const totalCostos = crops.reduce((sum, c) => sum + (Number(c.totalProductionCost) || 0), 0);
    const totalVentas = crops.reduce((sum, c) => sum + (Number(c.totalSales) || 0), 0);
    const mub = totalVentas > 0 ? (totalVentas - totalCostos) / totalVentas : 0;
    return { totalCostos, totalVentas, mub };
  }, [crops]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Resumen Consolidado General */}
      <View style={styles.consolidatedBox}>
        <Text style={styles.consolidatedTitle}>CONSOLIDADO AGROPECUARIO (HC.AGRICOLA)</Text>
        <View style={styles.consolidatedGrid}>
          <View style={styles.consolidatedCol}>
            <Text style={styles.consolidatedLabel}>VENTAS TOTALES</Text>
            <Text style={styles.consolidatedValueSales}>
              Bs. {consolidated.totalVentas.toLocaleString('es-BO')}
            </Text>
          </View>
          <View style={styles.consolidatedCol}>
            <Text style={styles.consolidatedLabel}>COSTOS TOTALES</Text>
            <Text style={styles.consolidatedValueCost}>
              Bs. {consolidated.totalCostos.toLocaleString('es-BO')}
            </Text>
          </View>
          <View style={styles.consolidatedCol}>
            <Text style={styles.consolidatedLabel}>MUB CONSOLIDADO</Text>
            <Text style={styles.consolidatedValueMub}>
              {(consolidated.mub * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Selector de Cultivos Registrados */}
      <View style={styles.cropsSelectorSection}>
        <View style={styles.cropsSelectorHeader}>
          <Text style={styles.cropsSelectorTitle}>
            Cultivos de la Unidad ({crops.length})
          </Text>
          <TouchableOpacity style={styles.addCropBtn} onPress={handleAddCrop} activeOpacity={0.8}>
            <Text style={styles.addCropBtnText}>+ Agregar Cultivo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropsPills}>
          {crops.map((c, idx) => {
            const isActive = idx === activeCropIndex;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.cropPill, isActive && styles.cropPillActive]}
                onPress={() => setActiveCropIndex(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cropPillText, isActive && styles.cropPillTextActive]}>
                  🌾 {c.productName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Ficha Técnica del Cultivo Activo */}
      {selectedCrop && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeader}>{selectedCrop.productName}</Text>
              <Text style={styles.sectionDesc}>
                Unidad: {selectedCrop.yieldUnit} • {selectedCrop.cultivatedAreaHectares} Hectáreas
              </Text>
            </View>
            <View style={styles.mubBadge}>
              <Text style={styles.mubLabel}>MUB</Text>
              <Text style={styles.mubValue}>
                {(selectedCrop.grossMarginPercentage * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Parámetros Técnicos */}
          <View style={styles.paramsGrid}>
            <View style={styles.paramBox}>
              <Text style={styles.paramLabel}>SUPERFICIE (HAS)</Text>
              <TextInput
                style={styles.paramInput}
                value={String(selectedCrop.cultivatedAreaHectares)}
                onChangeText={(val) =>
                  handleUpdateCrop('cultivatedAreaHectares', Number(val.replace(/[^0-9.]/g, '')) || 1)
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.paramBox}>
              <Text style={styles.paramLabel}>RTO. / HA</Text>
              <TextInput
                style={styles.paramInput}
                value={String(selectedCrop.yieldPerHectare)}
                onChangeText={(val) =>
                  handleUpdateCrop('yieldPerHectare', Number(val.replace(/[^0-9.]/g, '')) || 0)
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.paramBox}>
              <Text style={styles.paramLabel}>MERMA / CONSUMO</Text>
              <TextInput
                style={styles.paramInput}
                value={String(selectedCrop.harvestWasteOrConsumption)}
                onChangeText={(val) =>
                  handleUpdateCrop('harvestWasteOrConsumption', Number(val.replace(/[^0-9.]/g, '')) || 0)
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.paramBox}>
              <Text style={styles.paramLabel}>PRECIO VENTA (BS)</Text>
              <TextInput
                style={styles.paramInput}
                value={String(selectedCrop.salePrice)}
                onChangeText={(val) =>
                  handleUpdateCrop('salePrice', Number(val.replace(/[^0-9.]/g, '')) || 0)
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Totales del Cultivo */}
          <View style={styles.cropTotalsRow}>
            <View style={styles.cropTotalCol}>
              <Text style={styles.cropTotalLabel}>RTO. NETO VENDIBLE</Text>
              <Text style={styles.cropTotalValue}>
                {selectedCrop.totalYield} {selectedCrop.yieldUnit}
              </Text>
            </View>
            <View style={styles.cropTotalCol}>
              <Text style={styles.cropTotalLabel}>VENTAS TOTALES</Text>
              <Text style={[styles.cropTotalValue, { color: BDP_COLORS.primary }]}>
                Bs. {selectedCrop.totalSales.toLocaleString('es-BO')}
              </Text>
            </View>
            <View style={styles.cropTotalCol}>
              <Text style={styles.cropTotalLabel}>COSTOS PRODUCCIÓN</Text>
              <Text style={[styles.cropTotalValue, { color: BDP_COLORS.rose }]}>
                Bs. {selectedCrop.totalProductionCost.toLocaleString('es-BO')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Desglose de Rubros de Costos del Cultivo */}
      {selectedCrop && selectedCrop.costItems && (
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            📋 Desglose de Rubros de Costo ({selectedCrop.costItems.length})
          </Text>
          <Text style={styles.sectionDesc}>
            Edita las cantidades o costos unitarios para recalcular los márgenes en tiempo real.
          </Text>

          <View style={styles.costItemsList}>
            {selectedCrop.costItems.map((item, itIdx) => {
              return (
                <View key={itIdx} style={styles.costItemRow}>
                  <View style={styles.costItemInfo}>
                    <Text style={styles.costItemName}>
                      {item.itemIndex}. {item.activityName}
                    </Text>
                    <Text style={styles.costItemCategory}>
                      {item.costCategory} • Unidad: {item.unit}
                    </Text>
                  </View>

                  <View style={styles.costItemInputs}>
                    <View style={styles.costInputGroup}>
                      <Text style={styles.costInputSubLabel}>CANT.</Text>
                      <TextInput
                        style={styles.costInputSmall}
                        value={String(item.quantity)}
                        onChangeText={(v) =>
                          handleUpdateCostItem(itIdx, 'quantity', Number(v.replace(/[^0-9.]/g, '')) || 0)
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.costInputGroup}>
                      <Text style={styles.costInputSubLabel}>C. UNIT (BS)</Text>
                      <TextInput
                        style={styles.costInputSmall}
                        value={String(item.unitCost)}
                        onChangeText={(v) =>
                          handleUpdateCostItem(itIdx, 'unitCost', Number(v.replace(/[^0-9.]/g, '')) || 0)
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.costTotalCol}>
                      <Text style={styles.costInputSubLabel}>TOTAL</Text>
                      <Text style={styles.costItemTotal}>
                        Bs. {Number(item.totalCost).toLocaleString('es-BO')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Botón Siguiente */}
      <TouchableOpacity style={styles.nextBtn} onPress={onNavigateNext} activeOpacity={0.8}>
        <Text style={styles.nextBtnText}>Continuar a Flujo de Caja ➡️</Text>
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
  consolidatedBox: {
    backgroundColor: BDP_COLORS.navy,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  consolidatedTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  consolidatedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consolidatedCol: {
    flex: 1,
  },
  consolidatedLabel: {
    fontSize: 8,
    color: BDP_COLORS.slate300,
    fontWeight: '700',
    marginBottom: 2,
  },
  consolidatedValueSales: {
    fontSize: 14,
    fontWeight: '900',
    color: '#38BDF8',
  },
  consolidatedValueCost: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FCA5A5',
  },
  consolidatedValueMub: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4ADE80',
  },
  cropsSelectorSection: {
    backgroundColor: BDP_COLORS.white,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    gap: 8,
  },
  cropsSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropsSelectorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: BDP_COLORS.slate800,
  },
  addCropBtn: {
    backgroundColor: BDP_COLORS.emerald,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addCropBtnText: {
    color: BDP_COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  cropsPills: {
    gap: 6,
  },
  cropPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: BDP_COLORS.slate100,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
  },
  cropPillActive: {
    backgroundColor: BDP_COLORS.primary,
    borderColor: BDP_COLORS.primary,
  },
  cropPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: BDP_COLORS.slate700,
  },
  cropPillTextActive: {
    color: BDP_COLORS.white,
    fontWeight: '800',
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: BDP_COLORS.navy,
  },
  sectionDesc: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
    marginTop: 2,
  },
  mubBadge: {
    backgroundColor: BDP_COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: BDP_COLORS.emeraldBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  mubLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#065F46',
  },
  mubValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#065F46',
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paramBox: {
    flex: 1,
    minWidth: '45%',
    gap: 2,
  },
  paramLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: BDP_COLORS.slate400,
    textTransform: 'uppercase',
  },
  paramInput: {
    backgroundColor: BDP_COLORS.slate50,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
    color: BDP_COLORS.slate900,
  },
  cropTotalsRow: {
    flexDirection: 'row',
    backgroundColor: BDP_COLORS.lightBlue,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
  },
  cropTotalCol: {
    flex: 1,
  },
  cropTotalLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: BDP_COLORS.slate500,
    marginBottom: 2,
  },
  cropTotalValue: {
    fontSize: 12,
    fontWeight: '900',
    color: BDP_COLORS.slate900,
  },
  costItemsList: {
    gap: 8,
  },
  costItemRow: {
    backgroundColor: BDP_COLORS.slate50,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate200,
    gap: 6,
  },
  costItemInfo: {
    borderBottomWidth: 1,
    borderBottomColor: BDP_COLORS.slate200,
    paddingBottom: 4,
  },
  costItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: BDP_COLORS.slate900,
  },
  costItemCategory: {
    fontSize: 10,
    color: BDP_COLORS.slate500,
  },
  costItemInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costInputGroup: {
    flex: 1,
    gap: 2,
  },
  costInputSubLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: BDP_COLORS.slate400,
  },
  costInputSmall: {
    backgroundColor: BDP_COLORS.white,
    borderWidth: 1,
    borderColor: BDP_COLORS.slate300,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
    color: BDP_COLORS.slate900,
  },
  costTotalCol: {
    flex: 1.2,
    alignItems: 'flex-end',
    gap: 2,
  },
  costItemTotal: {
    fontSize: 12,
    fontWeight: '900',
    color: BDP_COLORS.rose,
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
