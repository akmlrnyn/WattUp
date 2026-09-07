export interface AdminParticipant {
  userId: string;
  name: string;
  email: string;
  vehicleName: string;

  sessionCount: number;
  streakDays: number;

  totalEnergyKwh: number;
  shiftedEnergyKwh: number;
  savingsAmount: number;

  offPeakRate: number;
  averageScore: number;
}

export interface AdminDailyOffPeakRate {
  label: string;
  rate: number;
}

export interface AdminDashboardData {
  registeredUsers: number;
  activeUsers: number;

  totalSessions: number;
  totalShiftedEnergyKwh: number;
  totalSavings: number;

  averageOffPeakRate: number;
  cycleCompletionRate: number;
  completedCycleUsers: number;

  currentCycleNumber: number;
  currentCycleDay: number;

  dailyOffPeakRates: AdminDailyOffPeakRate[];

  participants: AdminParticipant[];
}

export interface AdminDashboardRepository {
  getDashboard(): Promise<AdminDashboardData>;
}