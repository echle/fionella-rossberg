import { describe, it, expect } from 'vitest';
import { phaserConfig } from '../../src/config/phaserConfig';

describe('UI-Optimierung', () => {
  it('soll die Canvas mit Mindest- und Maximalwerten initialisieren', () => {
    expect(phaserConfig.width).toBeGreaterThanOrEqual(800);
    expect(phaserConfig.height).toBeGreaterThanOrEqual(600);
    expect(phaserConfig.width).toBeLessThanOrEqual(2560);
    expect(phaserConfig.height).toBeLessThanOrEqual(1440);
  });

  it('soll die Canvas korrekt skalieren und zentrieren', () => {
    expect(phaserConfig.scale.mode).toBe(Phaser.Scale.FIT);
    expect(phaserConfig.scale.autoCenter).toBe(Phaser.Scale.CENTER_BOTH);
  });
});
