import type {
  DashboardLeaderboardEntry,
  DashboardRepository,
} from "../../domain/repositories/dashboard.repository";

export interface UserDashboardViewModel {
  weekSavings: number;
  weekShiftedEnergyKwh: number;

  totalSavings: number;
  totalShiftedEnergyKwh: number;

  averageScore: number;
  streakDays: number;

  leaderboard: DashboardLeaderboardEntry[];
  leaderboardPreview: DashboardLeaderboardEntry[];

  currentUserRank: number;
}

export class GetUserDashboardUseCase {
  constructor(
    private readonly repository: DashboardRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<UserDashboardViewModel> {
    const dashboard =
      await this.repository.getUserDashboard(userId);

    const currentUserEntry =
      dashboard.leaderboard.find(
        (entry) => entry.isCurrentUser,
      );

    const topFour = dashboard.leaderboard.slice(0, 4);

    const leaderboardPreview =
      currentUserEntry &&
      !topFour.some(
        (entry) => entry.userId === userId,
      )
        ? [
            ...dashboard.leaderboard.slice(0, 3),
            currentUserEntry,
          ]
        : topFour;

    return {
      weekSavings: dashboard.weekSavings,

      weekShiftedEnergyKwh:
        dashboard.weekShiftedEnergyKwh,

      totalSavings: dashboard.totalSavings,

      totalShiftedEnergyKwh:
        dashboard.totalShiftedEnergyKwh,

      averageScore: dashboard.averageScore,
      streakDays: dashboard.streakDays,

      leaderboard: dashboard.leaderboard,
      leaderboardPreview,

      currentUserRank: currentUserEntry?.rank ?? 0,
    };
  }
}