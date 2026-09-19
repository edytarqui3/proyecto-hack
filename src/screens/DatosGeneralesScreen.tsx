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
import { Client } from '../types';
import { SelectModal } from '../components/SelectModal';
import { GEO_DATA } from '../constants/geography';

interface DatosGeneralesScreenProps {
  clientForm: Client;
  onChangeClientForm: (form: Client) => void;
  onNavigateNext: () => void;
}

const MARITAL_STATUSES = ['SOLTERO(A)', 'CASADO(A)', 'CONVIVIENTE', 'VIUDO(A)', 'DIVORCIADO(A)'];
const EDUCATION_LEVELS = ['Primaria', 'Secundaria', 'Bachiller', 'Técnico', 'Universitario'];
const HOUSING_TYPES = ['Propia', 'Familiar', 'Alquilada', 'Anticrético'];
const TENURE_TYPES = ['Propia', 'Alquilada', 'Comunitaria', 'Al Partir', 'Concesión'];
const SECTORS = ['AGRICOLA', 'PECUARIO', 'AGROINDUSTRIAL', 'COMERCIO'];

export const DatosGeneralesScreen: React.FC<DatosGeneralesScreenProps> = ({
  clientForm,
  onChangeClientForm,
  onNavigateNext,
}) => {
  const [maritalModalVisible, setMaritalModalVisible] = useState(false);
  const [educationModalVisible, setEducationModalVisible] = useState(false);
  const [housingModalVisible, setHousingModalVisible] = useState(false);
  const [tenureModalVisible, setTenureModalVisible] = useState(false);
  const [sectorModalVisible, setSectorModalVisible] = useState(false);

  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [provModalVisible, setProvModalVisible] = useState(false);
  const [munModalVisible, setMunModalVisible] = useState(false);

  // Departamentos
  const departments = useMemo(() => Object.keys(GEO_DATA), []);

  // Provincias dependientes del departamento
  const provinces = useMemo(() => {
    return clientForm.department && GEO_DATA[clientForm.department]
      ? Object.keys(GEO_DATA[clientForm.department])
      : [];
  }, [clientForm.department]);

  // Municipios dependientes de la provincia
  const municipalities = useMemo(() => {
    return clientForm.department &&
      clientForm.province &&
      GEO_DATA[clientForm.department]?.[clientForm.province]
      ? GEO_DATA[clientForm.department][clientForm.province]
      : [];
  }, [clientForm.department, clientForm.province]);

  const handleDeptSelect = (dept: string) => {
    const firstProv = GEO_DATA[dept] ? Object.keys(GEO_DATA[dept])[0] : '';
    const firstMun = firstProv && GEO_DATA[dept][firstProv] ? GEO_DATA[dept][firstProv][0] : '';
    onChangeClientForm({
      ...clientForm,
      department: dept,
      province: firstProv,
      municipality: firstMun,
    });
  };

  const handleProvSelect = (prov: string) => {
    const firstMun =
      clientForm.department && GEO_DATA[clientForm.department]?.[prov]
        ? GEO_DATA[clientForm.department][prov][0]
        : '';
    onChangeClientForm({
      ...clientForm,
      province: prov,
      municipality: firstMun,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Datos Personales del Solicitante */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>👤 1. Identificación del Solicitante</Text>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>NOMBRES</Text>
            <TextInput
              style={styles.input}
              value={clientForm.firstNames}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, firstNames: val })}
              placeholder="Nombres"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>PRIMER APELLIDO</Text>
            <TextInput
              style={styles.input}
              value={clientForm.firstSurname}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, firstSurname: val })}
              placeholder="Primer Apellido"
            />
          </View>
        </View>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>SEGUNDO APELLIDO</Text>
            <TextInput
              style={styles.input}
              value={clientForm.secondSurname}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, secondSurname: val })}
              placeholder="Segundo Apellido"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>APELLIDO DE CASADA</Text>
            <TextInput
              style={styles.input}
              value={clientForm.marriedSurname || ''}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, marriedSurname: val })}
              placeholder="(Opcional)"
            />
          </View>
        </View>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1.2 }]}>
            <Text style={styles.fieldLabel}>CÉDULA DE IDENTIDAD (CI)</Text>
            <TextInput
              style={[styles.input, { fontWeight: '700' }]}
              value={clientForm.documentId}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, documentId: val })}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 0.8 }]}>
            <Text style={styles.fieldLabel}>VENCIMIENTO</Text>
            <TextInput
              style={styles.input}
              value={clientForm.idExpirationDate}
              onChangeText={(val) => onChangeClientForm({ ...clientForm, idExpirationDate: val })}
              placeholder="AAAA-MM-DD"
            />
          </View>
        </View>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>ESTADO CIVIL</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setMaritalModalVisible(true)}
            >
              <Text style={styles.selectBtnText}>{clientForm.maritalStatus}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>CARGAS FAMILIARES</Text>
            <TextInput
              style={styles.input}
              value={String(clientForm.dependentsCount)}
              onChangeText={(val) =>
                onChangeClientForm({
                  ...clientForm,
                  dependentsCount: Number(val.replace(/[^0-9]/g, '')) || 0,
                })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>NIVEL DE INSTRUCCIÓN</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setEducationModalVisible(true)}
          >
            <Text style={styles.selectBtnText}>{clientForm.educationLevel}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Ubicación Geográfica con Selectores Dependientes */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📍 2. Ubicación Geográfica Dependiente</Text>
        <Text style={styles.sectionDesc}>
          Selecciona Departamento $\rightarrow$ Provincia $\rightarrow$ Municipio para autocompletar la jurisdicción.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DEPARTAMENTO</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setDeptModalVisible(true)}
          >
            <Text style={styles.selectBtnText}>{clientForm.department}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PROVINCIA ({clientForm.department})</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setProvModalVisible(true)}
          >
            <Text style={styles.selectBtnText}>{clientForm.province || 'Seleccionar Provincia'}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>MUNICIPIO ({clientForm.province})</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setMunModalVisible(true)}
          >
            <Text style={styles.selectBtnText}>{clientForm.municipality || 'Seleccionar Municipio'}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>LOCALIDAD / COMUNIDAD / SINDICATO (TEXTO LIBRE)</Text>
          <TextInput
            style={styles.input}
            value={clientForm.locality}
            onChangeText={(val) => onChangeClientForm({ ...clientForm, locality: val })}
            placeholder="Ej: Abra de la Cruz, Sindicato San Salvador..."
          />
        </View>
      </View>

      {/* 3. Tenencia y Antigüedad */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>🏡 3. Tenencia y Experiencia</Text>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>VIVIENDA</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setHousingModalVisible(true)}
            >
              <Text style={styles.selectBtnText}>{clientForm.housingType}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>UNIDAD PRODUCTIVA</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setTenureModalVisible(true)}
            >
              <Text style={styles.selectBtnText}>{clientForm.businessPremisesType}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>EXP. ACTIVIDAD (MESES)</Text>
            <TextInput
              style={styles.input}
              value={String(clientForm.activityExperienceMonths)}
              onChangeText={(val) =>
                onChangeClientForm({
                  ...clientForm,
                  activityExperienceMonths: Number(val.replace(/[^0-9]/g, '')) || 0,
                })
              }
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>ANTIG. LOCALIDAD (MESES)</Text>
            <TextInput
              style={styles.input}
              value={String(clientForm.localitySeniorityMonths)}
              onChangeText={(val) =>
                onChangeClientForm({
                  ...clientForm,
                  localitySeniorityMonths: Number(val.replace(/[^0-9]/g, '')) || 0,
                })
              }
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* 4. Actividad Económica y Central de Riesgos */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>🌾 4. Actividad Económica y Riesgo</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>SECTOR ECONÓMICO</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setSectorModalVisible(true)}
          >
            <Text style={styles.selectBtnText}>{clientForm.economicSector}</Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DESCRIPCIÓN ACTIVIDAD CAEDEC</Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            value={clientForm.economicActivityCaedec}
            onChangeText={(val) => onChangeClientForm({ ...clientForm, economicActivityCaedec: val })}
            multiline
          />
        </View>

        <View style={styles.ratingBox}>
          <View>
            <Text style={styles.ratingTitle}>CENTRAL DE RIESGOS (INFOCRED / CIC)</Text>
            <Text style={styles.ratingDate}>Fecha Consulta: {clientForm.infocredDate}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{clientForm.infocredRating}</Text>
          </View>
        </View>
      </View>

      {/* Botón de Navegación */}
      <TouchableOpacity style={styles.nextBtn} onPress={onNavigateNext} activeOpacity={0.8}>
        <Text style={styles.nextBtnText}>Continuar a Hoja de Costos Agrícola ➡️</Text>
      </TouchableOpacity>

      {/* Modales */}
      <SelectModal
        visible={deptModalVisible}
        title="Seleccionar Departamento"
        options={departments}
        selectedValue={clientForm.department}
        onSelect={handleDeptSelect}
        onClose={() => setDeptModalVisible(false)}
      />

      <SelectModal
        visible={provModalVisible}
        title={`Provincias de ${clientForm.department}`}
        options={provinces}
        selectedValue={clientForm.province}
        onSelect={handleProvSelect}
        onClose={() => setProvModalVisible(false)}
      />

      <SelectModal
        visible={munModalVisible}
        title={`Municipios de ${clientForm.province}`}
        options={municipalities}
        selectedValue={clientForm.municipality}
        onSelect={(mun) => onChangeClientForm({ ...clientForm, municipality: mun })}
        onClose={() => setMunModalVisible(false)}
      />

      <SelectModal
        visible={maritalModalVisible}
        title="Estado Civil"
        options={MARITAL_STATUSES}
        selectedValue={clientForm.maritalStatus}
        onSelect={(status) => onChangeClientForm({ ...clientForm, maritalStatus: status })}
        onClose={() => setMaritalModalVisible(false)}
      />

      <SelectModal
        visible={educationModalVisible}
        title="Nivel de Instrucción"
        options={EDUCATION_LEVELS}
        selectedValue={clientForm.educationLevel}
        onSelect={(lvl) => onChangeClientForm({ ...clientForm, educationLevel: lvl })}
        onClose={() => setEducationModalVisible(false)}
      />

      <SelectModal
        visible={housingModalVisible}
        title="Tenencia de Vivienda"
        options={HOUSING_TYPES}
        selectedValue={clientForm.housingType}
        onSelect={(h) => onChangeClientForm({ ...clientForm, housingType: h })}
        onClose={() => setHousingModalVisible(false)}
      />

      <SelectModal
        visible={tenureModalVisible}
        title="Tenencia de Unidad Productiva"
        options={TENURE_TYPES}
        selectedValue={clientForm.businessPremisesType}
        onSelect={(t) => onChangeClientForm({ ...clientForm, businessPremisesType: t })}
        onClose={() => setTenureModalVisible(false)}
      />

      <SelectModal
        visible={sectorModalVisible}
        title="Sector Económico"
        options={SECTORS}
        selectedValue={clientForm.economicSector}
        onSelect={(s) => onChangeClientForm({ ...clientForm, economicSector: s })}
        onClose={() => setSectorModalVisible(false)}
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: BDP_COLORS.navy,
  },
  sectionDesc: {
    fontSize: 11,
    color: BDP_COLORS.slate500,
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
  ratingBox: {
    backgroundColor: BDP_COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: BDP_COLORS.emeraldBorder,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  ratingDate: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: BDP_COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BDP_COLORS.emerald,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
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
