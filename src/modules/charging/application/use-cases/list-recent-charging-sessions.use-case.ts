import type { ChargingSessionRepository } from "../../domain/repositories/charging-session.repository";

export class ListRecentChargingSessionsUseCase {
  constructor(
    private readonly repository: ChargingSessionRepository,
  ) {}

  async execute(userId: string, limit = 10) {
    const safeLimit = Math.min(
      Math.max(Math.trunc(limit), 1),
      50,
    );

    return this.repository.findRecentByUserId(
      userId,
      safeLimit,
    );
  }
}