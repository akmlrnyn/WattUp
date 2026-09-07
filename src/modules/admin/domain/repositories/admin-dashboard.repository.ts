export interface AdminParticipant {
  userId: string;
  name: string;
  email: string;

  sessionCount: number;

  totalEnergyKwh: number;
  shiftedEnergyKwh: number;
  savingsAmount: number;

  offPeakRate: number;
  averageScore: number;
}

export interface AdminDashboardData {
  registeredUsers: number;
  activeUsers: number;

  totalSessions: number;
  totalShiftedEnergyKwh: number;
  totalSavings: number;

  averageOffPeakRate: number;

  participants: AdminParticipant[];
}

export interface AdminDashboardRepository {
  getDashboard(): Promise<AdminDashboardData>;
}