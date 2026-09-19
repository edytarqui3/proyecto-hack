import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Temas y Tipos
import { BDP_COLORS } from './src/constants/theme';
import {
  Officer,
  Client,
  Crop,
  Solicitud,
  SolicitudConditions,
  TabType,
} from './src/types';

// Constantes institucionales BDP
import { DEMO_OFFICERS } from './src/constants/officers';
import { CLIENTS_DATABASE } from './src/constants/clients';
import { BENCHMARK_CROPS } from './src/constants/benchmarkCrops';
import { INITIAL_SOLICITUDES } from './src/constants/initialSolicitudes';

// Servicios de Conexión Backend
import { ApiService } from './src/services/api';

// Componentes Reutilizables
import { Header } from './src/components/Header';
import { TabBar } from './src/components/TabBar';
import { OfficerModal } from './src/components/OfficerModal';
import { Toast } from './src/components/Toast';

// Pantallas del Sistema de Microcréditos BDP
import { ListadoScreen } from './src/screens/ListadoScreen';
import { CaratulaScreen } from './src/screens/CaratulaScreen';
import { DatosGeneralesScreen } from './src/screens/DatosGeneralesScreen';
import { HojaCostosScreen } from './src/screens/HojaCostosScreen';
import { FlujoCajaScreen } from './src/screens/FlujoCajaScreen';
import { ResolucionScreen } from './src/screens/ResolucionScreen';

export default function App() {
  // Lista de Solicitudes (Memoria + Sincronización con BD)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(INITIAL_SOLICITUDES);

  // Oficial de Crédito Activo
  const [currentOfficer, setCurrentOfficer] = useState<Officer>(DEMO_OFFICERS[0]);
  const [officerModalVisible, setOfficerModalVisible] = useState(false);

  // Pestaña Activa del Flujo de Evaluación
  const [activeTab, setActiveTab] = useState<TabType>('listado');

  // Solicitud en Evaluación Activa
  const [solicitudNumero, setSolicitudNumero] = useState<number | string>(202600148);

  // Condiciones Financieras
  const [conditions, setConditions] = useState<SolicitudConditions>({
    agency: 'AGENCIA PADCAYA',
    visitDate: '2026-08-03',
    creditDestination: 'Capital de Operaciones Agropecuario',
    applicantName: 'ADELFA CHAVARRIA FLORES Vda De. BURGOS',
    applicantDocument: '5021899',
    creditOfficer: 'Ing. Mariana Ríos (AGENCIA PADCAYA)',
    requestedAmount: 20000,
    termMonths: 24,
    graceMonths: 0,
    interestRate: 11.0,
    paymentFrequency: 'SEMESTRAL',
    disbursementMonth: 'Septiembre',
    amortizationType: 'FRANCES',
    operationType: 'Operación',
    currency: 'BOB',
  });

  // Búsqueda y Gestión de Cliente
  const [searchCI, setSearchCI] = useState('5021899');
  const [clientFoundStatus, setClientFoundStatus] = useState<'EXISTENTE' | 'NUEVO'>('EXISTENTE');
  const [matchedClient, setMatchedClient] = useState<Client | null>(CLIENTS_DATABASE[0]);
  const [clientForm, setClientForm] = useState<Client>(CLIENTS_DATABASE[0]);

  // Cultivos Agrícolas y Hoja de Costos
  const [crops, setCrops] = useState<Crop[]>(BENCHMARK_CROPS);

  // Estados de Interfaz
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'saving' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  // Sincronización Inicial con Backend NestJS (si está encendido)
  useEffect(() => {
    let isMounted = true;
    const loadFromBackend = async () => {
      try {
        const backendList = await ApiService.getCreditEvaluations();
        if (isMounted && backendList && backendList.length > 0) {
          setSolicitudes((prev) => {
            const mergedMap = new Map<string, Solicitud>();
            prev.forEach((s) => mergedMap.set(String(s.code), s));

            backendList.forEach((be: any) => {
              const mapped: Solicitud = {
                id: be.id,
                code: be.code,
                applicantName: be.applicantName || be.applicant_name || 'Sin Nombre',
                applicantDocument: be.applicantDocument || be.applicant_document || '',
                status: be.status || 'EN_EVALUACION',
                requestedAmount: Number(be.requestedAmount || be.requested_amount) || 0,
                termMonths: be.termMonths || be.term_months || 24,
                graceMonths: be.graceMonths || be.grace_months || 0,
                interestRate: Number(be.interestRate || be.interest_rate) || 11.0,
                paymentFrequency: be.paymentFrequency || be.payment_frequency || 'SEMESTRAL',
                creditOfficer: be.creditOfficer || be.credit_officer || currentOfficer.name,
                agency: be.agency || currentOfficer.agency,
                disbursementMonth: be.disbursementMonth || be.disbursement_month || 'Marzo',
                amortizationType: be.amortizationType || be.amortization_type || 'FRANCES',
                operationType: be.operationType || be.operation_type || 'Operación',
                currency: be.currency || 'BOB',
                createdAt: be.createdAt || be.created_at || new Date().toISOString(),
                crops: be.crops || [],
              };
              mergedMap.set(String(mapped.code), mapped);
            });

            return Array.from(mergedMap.values());
          });
        }
      } catch (e: any) {
        console.log('[BDP] Backend offline en arranque. Usando datos base locales.');
      }
    };

    loadFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Notificación Toast Automática
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'saving' = 'success') => {
    setToast({ message, type });
  }, []);

  // Cálculo Dinámico de Cuota Francesa
  const cuotaEstimada = useMemo(() => {
    const p = Number(conditions.requestedAmount) || 0;
    const tasaAnual = (Number(conditions.interestRate) || 11.0) / 100;
    const freq = conditions.paymentFrequency;
    const m = freq === 'SEMESTRAL' ? 2 : freq === 'TRIMESTRAL' ? 4 : freq === 'BIMESTRAL' ? 6 : freq === 'ANUAL' ? 1 : 12;
    const r = tasaAnual / m;
    const meses = Number(conditions.termMonths) || 24;
    const n = Math.max(1, Math.round(meses / (12 / m)));

    if (p <= 0) return 0;
    if (r <= 0) return p / n;
    const cuota = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(cuota * 100) / 100;
  }, [conditions.requestedAmount, conditions.interestRate, conditions.paymentFrequency, conditions.termMonths]);

  // Manejador: Cambiar Oficial de Crédito
  const handleSelectOfficer = (officer: Officer) => {
    setCurrentOfficer(officer);
    setOfficerModalVisible(false);
    showToast(`Oficial Activo: ${officer.name} (${officer.agency})`, 'success');
  };

  // Manejador: Crear Nueva Solicitud (Secuencia Numérica Consecutiva)
  const handleNewSolicitud = () => {
    const numericCodes = solicitudes
      .map((s) => Number(s.code))
      .filter((n) => !isNaN(n));
    const maxNum = numericCodes.length > 0 ? Math.max(...numericCodes) : 202600151;
    const nextCode = Math.max(maxNum + 1, 202600152);

    setSolicitudNumero(nextCode);
    setConditions({
      agency: currentOfficer.agency,
      visitDate: new Date().toISOString().split('T')[0],
      creditDestination: 'Capital de Operaciones Agropecuario',
      applicantName: '',
      applicantDocument: '',
      creditOfficer: `${currentOfficer.name} (${currentOfficer.agency})`,
      requestedAmount: 20000,
      termMonths: 24,
      graceMonths: 0,
      interestRate: 11.0,
      paymentFrequency: 'SEMESTRAL',
      disbursementMonth: 'Septiembre',
      amortizationType: 'FRANCES',
      operationType: 'Operación',
      currency: 'BOB',
    });

    setSearchCI('');
    setClientFoundStatus('NUEVO');
    setMatchedClient(null);

    const emptyClient: Client = {
      documentId: '',
      firstSurname: '',
      secondSurname: '',
      marriedSurname: '',
      firstNames: '',
      idExpirationDate: '2030-01-01',
      maritalStatus: 'SOLTERO(A)',
      dependentsCount: 0,
      localitySeniorityMonths: 24,
      activityExperienceMonths: 36,
      educationLevel: 'Secundaria',
      housingType: 'Propia',
      businessPremisesType: 'Propia',
      department: 'COCHABAMBA',
      province: 'Carrasco',
      municipality: 'Ivirgarzama',
      locality: '',
      infocredRating: 'Calificación 5',
      infocredDate: new Date().toISOString().split('T')[0],
      economicSector: 'AGRICOLA',
      economicActivityCaedec: 'CULTIVO DE HORTALIZAS Y FRUTALES',
      creditHistory: [],
      monthlyFamilyExpenses: 2500,
      monthlyOperatingExpenses: 600,
    };
    setClientForm(emptyClient);

    // Cultivo inicial benchmark
    setCrops([BENCHMARK_CROPS[0]]);
    setActiveTab('caratula');
    showToast(`Nueva Solicitud N° ${nextCode} creada para ${currentOfficer.agency}`, 'success');
  };

  // Manejador: Seleccionar Solicitud de la Bandeja
  const handleSelectSolicitud = (sol: Solicitud, targetTab: TabType) => {
    setSolicitudNumero(sol.code);

    setConditions({
      agency: sol.agency || currentOfficer.agency,
      visitDate: sol.visitDate || new Date().toISOString().split('T')[0],
      creditDestination: sol.creditDestination || 'Capital de Operaciones Agropecuario',
      applicantName: sol.applicantName,
      applicantDocument: sol.applicantDocument,
      creditOfficer: sol.creditOfficer || `${currentOfficer.name} (${currentOfficer.agency})`,
      requestedAmount: sol.requestedAmount,
      termMonths: sol.termMonths || 24,
      graceMonths: sol.graceMonths || 0,
      interestRate: sol.interestRate || 11.0,
      paymentFrequency: sol.paymentFrequency || 'SEMESTRAL',
      disbursementMonth: sol.disbursementMonth || 'Septiembre',
      amortizationType: sol.amortizationType || 'FRANCES',
      operationType: sol.operationType || 'Operación',
      currency: sol.currency || 'BOB',
    });

    setSearchCI(sol.applicantDocument || '');

    // Buscar si el cliente ya está registrado en clientes demo o crear
    const found = CLIENTS_DATABASE.find((c) => c.documentId === sol.applicantDocument);
    if (found) {
      setMatchedClient(found);
      setClientForm(found);
      setClientFoundStatus('EXISTENTE');
    } else {
      const parts = sol.applicantName.split(' ');
      const fallbackClient: Client = {
        documentId: sol.applicantDocument,
        firstSurname: parts[1] || '',
        secondSurname: parts[2] || '',
        marriedSurname: '',
        firstNames: parts[0] || 'SOLICITANTE',
        idExpirationDate: '2030-01-01',
        maritalStatus: 'CASADO(A)',
        dependentsCount: 2,
        localitySeniorityMonths: 60,
        activityExperienceMonths: 48,
        educationLevel: 'Secundaria',
        housingType: 'Propia',
        businessPremisesType: 'Propia',
        department: sol.agency.includes('PATACAMAYA') ? 'LA PAZ' : sol.agency.includes('IVIRGARZAMA') ? 'COCHABAMBA' : 'TARIJA',
        province: sol.agency.includes('PATACAMAYA') ? 'Aroma' : sol.agency.includes('IVIRGARZAMA') ? 'Carrasco' : 'Aniceto Arce',
        municipality: sol.agency.includes('PATACAMAYA') ? 'Patacamaya' : sol.agency.includes('IVIRGARZAMA') ? 'Ivirgarzama' : 'Padcaya',
        locality: 'Comunidad Principal',
        infocredRating: 'Calificación 5',
        infocredDate: new Date().toISOString().split('T')[0],
        economicSector: 'AGRICOLA',
        economicActivityCaedec: 'CULTIVO DE CEREALES Y HORTALIZAS',
        creditHistory: [],
        monthlyFamilyExpenses: 2870,
        monthlyOperatingExpenses: 650,
      };
      setMatchedClient(fallbackClient);
      setClientForm(fallbackClient);
      setClientFoundStatus('EXISTENTE');
    }

    if (sol.crops && sol.crops.length > 0) {
      setCrops(sol.crops);
    } else {
      setCrops(BENCHMARK_CROPS);
    }

    setActiveTab(targetTab);
  };

  // Manejador: Búsqueda Reactiva por Cédula de Identidad (CI)
  const handleSearchCI = (ci: string) => {
    const cleanCI = ci.trim();
    setSearchCI(cleanCI);

    if (!cleanCI) {
      setClientFoundStatus('NUEVO');
      setMatchedClient(null);
      return;
    }

    const found = CLIENTS_DATABASE.find(
      (c) => c.documentId === cleanCI || c.documentId.toLowerCase() === cleanCI.toLowerCase()
    );

    if (found) {
      setClientFoundStatus('EXISTENTE');
      setMatchedClient(found);
      setClientForm(found);
      setConditions((prev) => ({
        ...prev,
        applicantName: `${found.firstNames} ${found.firstSurname} ${found.secondSurname} ${found.marriedSurname || ''}`.trim(),
        applicantDocument: found.documentId,
      }));
      showToast(`Cliente registrado: ${found.firstNames} ${found.firstSurname}`, 'success');
    } else {
      setClientFoundStatus('NUEVO');
      setMatchedClient(null);
      setClientForm((prev) => ({
        ...prev,
        documentId: cleanCI,
        firstNames: '',
        firstSurname: '',
        secondSurname: '',
        marriedSurname: '',
      }));
      setConditions((prev) => ({
        ...prev,
        applicantDocument: cleanCI,
      }));
      showToast(`CI ${cleanCI} no registrado. Complete los datos como cliente nuevo.`, 'saving');
    }
  };

  // Manejador: Guardar Solicitud Completa (Local + Backend NestJS)
  const handleSaveToBackend = async () => {
    setIsSaving(true);
    showToast('Guardando evaluación crediticia...', 'saving');

    const totalVentas = crops.reduce((sum, c) => sum + Number(c.totalSales || 0), 0);
    const totalCostos = crops.reduce((sum, c) => sum + Number(c.totalProductionCost || 0), 0);

    const payload = {
      code: String(solicitudNumero),
      applicantName: conditions.applicantName || `${clientForm.firstNames} ${clientForm.firstSurname}`.trim(),
      applicantDocument: conditions.applicantDocument || clientForm.documentId,
      status: 'EN_EVALUACION',
      requestedAmount: conditions.requestedAmount,
      termMonths: conditions.termMonths,
      graceMonths: conditions.graceMonths,
      interestRate: conditions.interestRate,
      paymentFrequency: conditions.paymentFrequency,
      creditOfficer: conditions.creditOfficer,
      agency: conditions.agency,
      disbursementMonth: conditions.disbursementMonth,
      amortizationType: conditions.amortizationType,
      operationType: conditions.operationType,
      currency: conditions.currency,
      totalSales: totalVentas,
      totalCost: totalCostos,
      netMargin: totalVentas - totalCostos,
      clientData: clientForm,
      crops,
    };

    // Actualizar lista local de inmediato
    setSolicitudes((prev) => {
      const idx = prev.findIndex((s) => String(s.code) === String(solicitudNumero));
      const updatedSol: Solicitud = {
        id: idx >= 0 ? prev[idx].id : `eval-${Date.now()}`,
        code: solicitudNumero,
        applicantName: payload.applicantName,
        applicantDocument: payload.applicantDocument,
        status: 'EN_EVALUACION',
        requestedAmount: payload.requestedAmount,
        termMonths: payload.termMonths,
        graceMonths: payload.graceMonths,
        paymentFrequency: payload.paymentFrequency,
        interestRate: payload.interestRate,
        creditOfficer: payload.creditOfficer || `${currentOfficer.name} (${currentOfficer.agency})`,
        agency: payload.agency,
        disbursementMonth: payload.disbursementMonth,
        amortizationType: payload.amortizationType,
        operationType: payload.operationType,
        currency: payload.currency,
        createdAt: idx >= 0 ? prev[idx].createdAt : new Date().toISOString(),
        crops,
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedSol;
        return copy;
      }
      return [updatedSol, ...prev];
    });

    // Intentar sincronizar con Backend NestJS
    try {
      const res = await ApiService.saveCreditEvaluation(payload);
      if (res.success) {
        showToast(`Solicitud N° ${solicitudNumero} sincronizada con Backend NestJS`, 'success');
      } else {
        showToast(`Guardado en memoria local (Servidor: ${res.error || 'Sin conexión'})`, 'success');
      }
    } catch (e: any) {
      showToast(`Guardado en memoria local (Servidor offline)`, 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={BDP_COLORS.navy} />

      {/* Header Institucional BDP */}
      <Header
        currentOfficer={currentOfficer}
        onPressOfficer={() => setOfficerModalVisible(true)}
        onPressNewSolicitud={handleNewSolicitud}
        activeTab={activeTab}
        solicitudNumero={solicitudNumero}
        solicitudAgency={conditions.agency}
        totalSolicitudes={solicitudes.length}
      />

      {/* Barra de Pestañas con Iconos y Estados */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        solicitudesCount={solicitudes.length}
      />

      {/* Contenedor Principal de Pantallas */}
      <View style={styles.contentContainer}>
        {activeTab === 'listado' && (
          <ListadoScreen
            solicitudes={solicitudes}
            onSelectSolicitud={handleSelectSolicitud}
            onNewSolicitud={handleNewSolicitud}
          />
        )}

        {activeTab === 'caratula' && (
          <CaratulaScreen
            solicitudNumero={solicitudNumero}
            conditions={conditions}
            onChangeConditions={setConditions}
            searchCI={searchCI}
            onSearchCI={handleSearchCI}
            clientFoundStatus={clientFoundStatus}
            matchedClient={matchedClient}
            cuotaEstimada={cuotaEstimada}
            onSaveToBackend={handleSaveToBackend}
            isSaving={isSaving}
            onNavigateNext={() => setActiveTab('datos_generales')}
          />
        )}

        {activeTab === 'datos_generales' && (
          <DatosGeneralesScreen
            clientForm={clientForm}
            onChangeClientForm={setClientForm}
            onNavigateNext={() => setActiveTab('hc_agricola')}
          />
        )}

        {activeTab === 'hc_agricola' && (
          <HojaCostosScreen
            crops={crops}
            onChangeCrops={setCrops}
            onNavigateNext={() => setActiveTab('flujo_caja')}
          />
        )}

        {activeTab === 'flujo_caja' && (
          <FlujoCajaScreen
            crops={crops}
            monthlyFamilyExpenses={Number(clientForm.monthlyFamilyExpenses) || 2870}
            monthlyOperatingExpenses={Number(clientForm.monthlyOperatingExpenses) || 650}
            requestedAmount={conditions.requestedAmount}
            onNavigateNext={() => setActiveTab('resol_cred')}
          />
        )}

        {activeTab === 'resol_cred' && (
          <ResolucionScreen
            conditions={conditions}
            crops={crops}
            cuotaEstimada={cuotaEstimada}
            currentOfficer={currentOfficer}
            onSaveToBackend={handleSaveToBackend}
            isSaving={isSaving}
          />
        )}
      </View>

      {/* Selector Modal de Oficial de Crédito */}
      <OfficerModal
        visible={officerModalVisible}
        currentOfficer={currentOfficer}
        onSelectOfficer={handleSelectOfficer}
        onClose={() => setOfficerModalVisible(false)}
      />

      {/* Toast Flotante de Notificaciones */}
      <Toast
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ type: null, message: '' })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BDP_COLORS.navy,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
