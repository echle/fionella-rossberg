import { applyDecay } from '../state/actions';

export class DecaySystem {
  private lastUpdateTime: number;
  private isActive: boolean = true;

  constructor() {
    this.lastUpdateTime = Date.now();
  }

  update(): void {
    if (!this.isActive) return;

    const currentTime = Date.now();
    const elapsedMs = currentTime - this.lastUpdateTime;

    // Apply decay every frame based on elapsed time
    if (elapsedMs > 0) {
      applyDecay(elapsedMs);
      this.lastUpdateTime = currentTime;
    }
  }

  pause(): void {
    this.isActive = false;
  }

  resume(): void {
    this.isActive = true;
    this.lastUpdateTime = Date.now(); // Reset to avoid large jump
  }

  reset(): void {
    this.lastUpdateTime = Date.now();
  }
}
