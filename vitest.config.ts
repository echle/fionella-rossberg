import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/main.ts', 'src/scenes/**']
    }
  },
  resolve: {
    alias: {
      // Use Phaser's dist build in tests to avoid Node.js require() issues
      'phaser': 'phaser/dist/phaser.js',
    },
  },
  define: {
    WEBGL_DEBUG: 'false',
    CANVAS_DEBUG: 'false',
    EXPERIMENTAL: 'false',
  },
});
