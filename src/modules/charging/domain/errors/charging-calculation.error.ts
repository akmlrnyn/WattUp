export class ChargingCalculationError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "ChargingCalculationError";

    Object.setPrototypeOf(
      this,
      ChargingCalculationError.prototype,
    );
  }
}