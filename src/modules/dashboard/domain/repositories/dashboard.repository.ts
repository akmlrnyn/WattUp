export interface DashboardLeaderboardEntry {
  userId: string;
  rank: number;
  displayName: string;
  shiftedEnergyKwh: number;
  savingsAmount: number;
  averageScore: number;
  isCurrentUser: boolean;
}

export interface UserDashboardData {
  weekSavings: number;
  weekShiftedEnergyKwh: number;

  totalSavings: number;
  totalShiftedEnergyKwh: number;

  averageScore: number;
  streakDays: number;

  leaderboard: DashboardLeaderboardEntry[];
}

export interface DashboardRepository {
  getUserDashboard(
    userId: string,
    now?: Date,
  ): Promise<UserDashboardData>;
}