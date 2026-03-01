export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

export interface BudgetCategory {
  id: string
  name: string
  icon: string
  spent: number
  budget: number
}

export interface Workspace {
  id: string
  name: string
  type: "personal" | "shared"
  memberCount: number
  role: string
  balance: number
  icon: string
}

export interface UserProfile {
  name: string
  email: string
  avatarInitials: string
  currency: string
  theme: string
}

export const mockUser: UserProfile = {
  name: "Carlos Lopez",
  email: "carlos@email.com",
  avatarInitials: "CL",
  currency: "MXN",
  theme: "Oscuro",
}

export const mockMessages: ChatMessage[] = [
  {
    id: "1",
    text: "Hola Carlos! Soy tu asistente financiero. Puedes decirme tus gastos y yo los registro por ti.",
    sender: "bot",
    timestamp: "9:00 AM",
  },
  {
    id: "2",
    text: "Gaste 150 en comida",
    sender: "user",
    timestamp: "9:02 AM",
  },
  {
    id: "3",
    text: "Listo! Registre $150 en Comida. Te quedan $850 de $1,000 este mes.",
    sender: "bot",
    timestamp: "9:02 AM",
  },
  {
    id: "4",
    text: "Tambien pague 100 de Uber",
    sender: "user",
    timestamp: "9:05 AM",
  },
  {
    id: "5",
    text: "Registrado! $100 en Transporte. Llevas $100 de $500 este mes. Vas muy bien!",
    sender: "bot",
    timestamp: "9:05 AM",
  },
  {
    id: "6",
    text: "Cuanto me queda para entretenimiento?",
    sender: "user",
    timestamp: "9:10 AM",
  },
  {
    id: "7",
    text: "En Entretenimiento tienes $50 disponibles de $400. Llevas gastados $350 este mes. Te recomiendo cuidar ese apartado.",
    sender: "bot",
    timestamp: "9:10 AM",
  },
]

export const mockBotResponses: string[] = [
  "Entendido! Ya lo registre en tus gastos.",
  "Listo! Tu gasto ha sido registrado correctamente.",
  "Anotado! Recuerda revisar tu dashboard para ver como vas.",
  "Registrado! Si quieres, puedo mostrarte un resumen de tu mes.",
  "Perfecto! Ya quedo anotado en tus apartados.",
]

export const mockBudgetCategories: BudgetCategory[] = [
  {
    id: "1",
    name: "Comida",
    icon: "utensils",
    spent: 650,
    budget: 1000,
  },
  {
    id: "2",
    name: "Transporte",
    icon: "car",
    spent: 100,
    budget: 500,
  },
  {
    id: "3",
    name: "Renta",
    icon: "home",
    spent: 800,
    budget: 800,
  },
  {
    id: "4",
    name: "Entretenimiento",
    icon: "gamepad-2",
    spent: 350,
    budget: 400,
  },
  {
    id: "5",
    name: "Ahorro",
    icon: "piggy-bank",
    spent: 250,
    budget: 2300,
  },
]

export const mockWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Mi Espacio Personal",
    type: "personal",
    memberCount: 1,
    role: "Propietario",
    balance: 2850,
    icon: "user",
  },
  {
    id: "2",
    name: "Casa Familia Lopez",
    type: "shared",
    memberCount: 4,
    role: "Administrador",
    balance: 12500,
    icon: "home",
  },
  {
    id: "3",
    name: "Viaje Cancun",
    type: "shared",
    memberCount: 3,
    role: "Miembro",
    balance: 4200,
    icon: "plane",
  },
]

// --- Shared expense members ---

export interface SharedMember {
  id: string
  name: string
  email: string
  initials: string
  role: "propietario" | "administrador" | "miembro"
  accepted: boolean
}

export const mockSharedMembers: SharedMember[] = [
  { id: "user-1", name: "Carlos Lopez", email: "carlos@email.com", initials: "CL", role: "administrador", accepted: true },
  { id: "user-2", name: "Maria Lopez", email: "maria@email.com", initials: "ML", role: "administrador", accepted: true },
  { id: "user-3", name: "Sofia Lopez", email: "sofia@email.com", initials: "SL", role: "miembro", accepted: true },
  { id: "user-4", name: "Pedro Lopez", email: "pedro@email.com", initials: "PL", role: "miembro", accepted: false },
]

// --- Shared transactions with states ---

export type TransactionStatus = "confirmada" | "pendiente" | "aceptada" | "rechazada" | "liquidada"

export interface SharedTransaction {
  id: string
  description: string
  amount: number
  category: string
  categoryIcon: string
  createdBy: string
  createdByInitials: string
  status: TransactionStatus
  dividedBetween: string[]
  date: string
  timestamp: string
}

export const mockSharedTransactions: SharedTransaction[] = [
  {
    id: "txn-1",
    description: "Despensa del Costco",
    amount: 3200,
    category: "Comida",
    categoryIcon: "utensils",
    createdBy: "Carlos Lopez",
    createdByInitials: "CL",
    status: "confirmada",
    dividedBetween: ["user-1", "user-2"],
    date: "2026-02-28",
    timestamp: "10:30 AM",
  },
  {
    id: "txn-2",
    description: "Recibo de luz - febrero",
    amount: 1850,
    category: "Servicios",
    categoryIcon: "zap",
    createdBy: "Maria Lopez",
    createdByInitials: "ML",
    status: "pendiente",
    dividedBetween: ["user-1", "user-2", "user-3"],
    date: "2026-02-27",
    timestamp: "3:15 PM",
  },
  {
    id: "txn-3",
    description: "Gas LP tanque completo",
    amount: 2100,
    category: "Servicios",
    categoryIcon: "flame",
    createdBy: "Carlos Lopez",
    createdByInitials: "CL",
    status: "aceptada",
    dividedBetween: ["user-1", "user-2"],
    date: "2026-02-25",
    timestamp: "11:00 AM",
  },
  {
    id: "txn-4",
    description: "Netflix familiar",
    amount: 299,
    category: "Entretenimiento",
    categoryIcon: "tv",
    createdBy: "Sofia Lopez",
    createdByInitials: "SL",
    status: "liquidada",
    dividedBetween: ["user-1", "user-2", "user-3", "user-4"],
    date: "2026-02-20",
    timestamp: "9:00 AM",
  },
  {
    id: "txn-5",
    description: "Reparacion de la puerta",
    amount: 800,
    category: "Hogar",
    categoryIcon: "wrench",
    createdBy: "Pedro Lopez",
    createdByInitials: "PL",
    status: "rechazada",
    dividedBetween: ["user-1", "user-3"],
    date: "2026-02-18",
    timestamp: "2:45 PM",
  },
]
