import type { ChargingSessionRepository, CreateChargingSessionRecord } from "../../domain/repositories/charging-session.repository";
export type CreateChargingSessionInput = CreateChargingSessionRecord;
export class CreateChargingSessionUseCase {
  constructor(private readonly repository: ChargingSessionRepository) {}
  async execute(input: CreateChargingSessionInput) {
    return this.repository.create(input);
  }
}
