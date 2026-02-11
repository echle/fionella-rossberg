import Phaser from 'phaser';

export class InputSystem {
  private scene: Phaser.Scene;
  private isDragging: boolean = false;
  private lastDragPosition: { x: number; y: number } | null = null;
  private readonly MIN_STROKE_DISTANCE = 15; // Minimum pixels for a valid stroke

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    // Handle pointer down (start drag)
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.lastDragPosition = { x: pointer.x, y: pointer.y };
    });

    // Handle pointer move (dragging)
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging || !this.lastDragPosition) return;

      const distance = Phaser.Math.Distance.Between(
        this.lastDragPosition.x,
        this.lastDragPosition.y,
        pointer.x,
        pointer.y
      );

      // Check if moved enough to count as a stroke
      if (distance >= this.MIN_STROKE_DISTANCE) {
        this.scene.events.emit('dragStroke', {
          startX: this.lastDragPosition.x,
          startY: this.lastDragPosition.y,
          endX: pointer.x,
          endY: pointer.y,
          distance: distance,
        });

        this.lastDragPosition = { x: pointer.x, y: pointer.y };
      }
    });

    // Handle pointer up (stop drag)
    this.scene.input.on('pointerup', () => {
      this.isDragging = false;
      this.lastDragPosition = null;
    });
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
  }
}
