/**
 * Vitest setup file to mock Canvas for Phaser tests
 */

import { vi } from 'vitest';

// Create a comprehensive canvas context mock
const createMockCanvasContext = () => ({
  fillStyle: '',
  strokeStyle: '',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineJoin: 'miter',
  lineWidth: 1,
  miterLimit: 10,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  filter: 'none',
  canvas: {},
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
    colorSpace: 'srgb',
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
    colorSpace: 'srgb',
  })),
  setTransform: vi.fn(),
  getTransform: vi.fn(),
  resetTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(() => false),
  isPointInStroke: vi.fn(() => false),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  arc: vi.fn(),
  arcTo: vi.fn(),
  ellipse: vi.fn(),
  rect: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({
    width: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
    hangingBaseline: 0,
    alphabeticBaseline: 0,
    ideographicBaseline: 0,
  })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createPattern: vi.fn(() => null),
  drawFocusIfNeeded: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  lineDashOffset: 0,
});

// Mock HTMLCanvasElement
if (typeof HTMLCanvasElement !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  
  HTMLCanvasElement.prototype.getContext = vi.fn(function (
    this: HTMLCanvasElement,
    contextType: string,
    options?: any
  ) {
    if (contextType === '2d') {
      return createMockCanvasContext() as any;
    }
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return {} as any; // Minimal WebGL mock
    }
    return null;
  }) as any;

  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,');
  HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
    callback?.(new Blob());
  }) as any;
}

// Mock WebGL for Phaser
if (typeof WebGLRenderingContext === 'undefined') {
  (globalThis as any).WebGLRenderingContext = class MockWebGLRenderingContext {} as any;
}

// Mock Image for asset loading
if (typeof Image !== 'undefined') {
  const OriginalImage = Image;
  (globalThis as any).Image = class MockImage extends OriginalImage {
    constructor() {
      super();
      // Immediately mark as loaded
      setTimeout(() => {
        Object.defineProperty(this, 'width', { value: 100, writable: true });
        Object.defineProperty(this, 'height', { value: 100, writable: true });
        Object.defineProperty(this, 'complete', { value: true });
        this.onload?.(new Event('load'));
      }, 0);
    }
  };
}
