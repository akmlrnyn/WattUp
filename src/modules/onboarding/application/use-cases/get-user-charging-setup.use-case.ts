import type { UserSetupRepository } from "../../domain/repositories/user-setup.repository";

export class GetUserChargingSetupUseCase {
  constructor(
    private readonly repository:
      UserSetupRepository,
  ) {}

  async execute(userId: string) {
    return this.repository
      .getChargingSetup(userId);
  }
}