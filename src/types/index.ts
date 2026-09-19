export interface Officer {
  id: string;
  name: string;
  email: string;
  role: 'OFICIAL_CREDITO' | 'SUPERVISOR';
  agency: string;
  region: string;
  avatar: string;
}

export interface CreditHistory {
  code: string;
  amount: number;
  termMonths: number;
  status: string;
  agency: string;
  year: string;
}

export interface Client {
  documentId: string;
  firstSurname: string;
  secondSurname: string;
  marriedSurname?: string;
  firstNames: string;
  idExpirationDate: string;
  maritalStatus: string;
  dependentsCount: number;
  localitySeniorityMonths: number;
  activityExperienceMonths: number;
  educationLevel: string;
  housingType: string;
  businessPremisesType: string;
  department: string;
  province: string;
  municipality: string;
  locality: string;
  infocredRating: string;
  infocredDate: string;
  economicSector: string;
  economicActivityCaedec: string;
  creditHistory: CreditHistory[];
  monthlyFamilyExpenses?: number;
  monthlyOperatingExpenses?: number;
}

export interface CostItem {
  itemIndex: number;
  activityName: string;
  costCategory: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Crop {
  cropIndex: number;
  productName: string;
  yieldUnit: string;
  cyclesPerYear: number;
  cultivatedAreaHectares: number;
  harvestWasteOrConsumption: number;
  yieldPerHectare: number;
  totalYield: number;
  salePrice: number;
  totalProductionCost: number;
  totalSales: number;
  grossMarginPercentage: number;
  salesMonthlyDistribution: number[];
  costsMonthlyDistribution: number[];
  costItems: CostItem[];
}

export interface Solicitud {
  id: string;
  code: number | string;
  visitDate?: string;
  applicantDocument: string;
  applicantName: string;
  agency: string;
  requestedAmount: number;
  termMonths: number;
  graceMonths?: number;
  paymentFrequency: string;
  interestRate: number;
  creditOfficer: string;
  economicSector?: string;
  status: 'EN_EVALUACION' | 'IN_REVIEW' | 'APROBADO' | 'APPROVED' | 'RECHAZADO' | 'REJECTED' | 'DRAFT';
  crops: Crop[];
  creditDestination?: string;
  amortizationType?: string;
  disbursementMonth?: string;
  operationType?: string;
  currency?: string;
  createdAt?: string;
  totalSales?: number;
  totalCost?: number;
  netMargin?: number;
}

export interface SolicitudConditions {
  agency: string;
  visitDate: string;
  requestedAmount: number;
  termMonths: number;
  graceMonths?: number;
  paymentFrequency: string;
  interestRate: number;
  creditDestination: string;
  amortizationType: string;
  applicantName?: string;
  applicantDocument?: string;
  creditOfficer?: string;
  disbursementMonth?: string;
  operationType?: string;
  currency?: string;
}

export type TabType = 'listado' | 'caratula' | 'datos_generales' | 'hc_agricola' | 'flujo_caja' | 'resol_cred';
