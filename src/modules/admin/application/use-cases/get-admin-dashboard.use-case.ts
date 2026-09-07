import type { AdminDashboardRepository } from "../../domain/repositories/admin-dashboard.repository";

export class GetAdminDashboardUseCase {
  constructor(
    private readonly repository: AdminDashboardRepository,
  ) {}

  async execute() {
    return this.repository.getDashboard();
  }
}