import { CreateChargingSessionUseCase } from "@/modules/charging/application/use-cases/create-charging-session.use-case";
import { ListRecentChargingSessionsUseCase } from "@/modules/charging/application/use-cases/list-recent-charging-sessions.use-case";
import { PrismaChargingSessionRepository } from "@/modules/charging/infrastructure/prisma-charging-session.repository";

import { GetUserDashboardUseCase } from "@/modules/dashboard/application/use-cases/get-user-dashboard.use-case";
import { PrismaDashboardRepository } from "@/modules/dashboard/infrastructure/prisma-dashboard.repository";

import { GetAdminDashboardUseCase } from "@/modules/admin/application/use-cases/get-admin-dashboard.use-case";
import { PrismaAdminDashboardRepository } from "@/modules/admin/infrastructure/prisma-admin-dashboard.repository";

const chargingSessionRepository =
  new PrismaChargingSessionRepository();

const dashboardRepository =
  new PrismaDashboardRepository();

const adminDashboardRepository =
  new PrismaAdminDashboardRepository();

export const dependencies = {
  charging: {
    createSession: new CreateChargingSessionUseCase(
      chargingSessionRepository,
    ),

    listRecentSessions:
      new ListRecentChargingSessionsUseCase(
        chargingSessionRepository,
      ),
  },

  dashboard: {
    getUserDashboard: new GetUserDashboardUseCase(
      dashboardRepository,
    ),
  },

  admin: {
    getDashboard: new GetAdminDashboardUseCase(
      adminDashboardRepository,
    ),
  },
} as const;