export enum OSStatus {
  DESMONTAGEM = 'Desmontagem',
  FUNILARIA = 'Funilaria',
  PREPARACAO = 'Preparação',
  PINTURA = 'Pintura',
  MONTAGEM = 'Montagem',
  POLIMENTO = 'Polimento',
  FINALIZADO = 'Finalizado'
}

export enum PartStatus {
  SOLICITADO = 'Solicitado',
  ENVIADO = 'Enviado',
  ENTREGUE = 'Entregue',
  EM_USO = 'Em Uso',
  UTILIZADO = 'Utilizado',
  DEVOLVIDO = 'Devolvido'
}

export enum PartType {
  PECA = 'Peça',
  INSUMO = 'Insumo/Material'
}

export interface Collaborator {
  id: string;
  name: string;
  role: 'Funileiro' | 'Pintor' | 'Preparador' | 'Montador' | 'Polidor' | 'Geral';
  phone?: string;
  status: 'Ativo' | 'Inativo';
}

export interface Part {
  id: string;
  name: string;
  code: string;
  type: PartType;
  quantity: number;
  priceUnit: number; // Preço de Venda ao cliente
  costUnit: number;  // Custo para a oficina
  status: PartStatus;
  supplier: string;
  arrivalDate?: string;
}

export interface LaborAllocation {
  id: string;
  collaboratorId?: string; // Link opcional para o cadastro
  workerName: string;
  role: 'Funileiro' | 'Pintor' | 'Preparador' | 'Montador';
  cost: number; // Valor pago ao profissional nesta OS (Custo)
  date: string;
}

export interface Vehicle {
  plate: string;
  model: string;
  brand: string;
  color: string;
  year: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  insurer?: string; // Seguradora
}

export interface ServiceOrder {
  id: string; // Number unique
  entryDate: string;
  deliveryForecast: string;
  client: Client;
  vehicle: Vehicle;
  status: OSStatus;
  description: string;
  technicalResponsible: string;
  
  // Listas
  parts: Part[];
  laborAllocations: LaborAllocation[]; // Nova lista de alocação

  // Financeiro
  servicesTotal: number; // Faturamento Mão de Obra (Venda para cliente)
  partsTotal: number;    // Faturamento Peças (Venda para cliente)
  finalPrice: number;    // Total Venda
  
  notes: string[];
  riskAssessment?: string; // AI Generated
}

export interface DashboardStats {
  totalActive: number;
  totalFinishedMonth: number;
  partsPending: number;
  revenueMonth: number;
}