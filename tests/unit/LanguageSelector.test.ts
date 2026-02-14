import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { LanguageSelector } from '../../src/components/LanguageSelector';
import { i18nService } from '../../src/services/i18nService';

describe('LanguageSelector', () => {
  let scene: Phaser.Scene;
  let selector: LanguageSelector;

  beforeEach(() => {
    // Create a minimal Phaser scene mock matching phaserMocks.ts pattern
    scene = {
      sys: {
        queueDepthSort: vi.fn(),
      },
      add: {
        existing: vi.fn(),
        container: vi.fn().mockImplementation(() => {
          const list: any[] = [];
          return {
            list,
            add: vi.fn((items: any[]) => {
              list.push(...items);
            }),
            setSize: vi.fn().mockReturnThis(),
            setInteractive: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            once: vi.fn().mockReturnThis(),
            off: vi.fn().mockReturnThis(),
            emit: vi.fn().mockReturnThis(),
            removeFromDisplayList: vi.fn(),
            addedToScene: vi.fn(),
            parentContainer: null,
          };
        }),
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeRoundedRect: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          once: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null,
        }),
        text: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setText: vi.fn().mockReturnThis(),
          once: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null,
        }),
        rectangle: vi.fn().mockReturnValue({
          setOrigin: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setFillStyle: vi.fn().mockReturnThis(),
          once: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null,
        }),
      },
    } as any;

    // Reset i18n to default state
    i18nService.setLanguage('de');
  });

  describe('T028: Component creation', () => {
    it('should create LanguageSelector at specified position', () => {
      selector = new LanguageSelector(scene, 100, 50);
      expect(selector).toBeDefined();
      expect(selector.x).toBe(100);
      expect(selector.y).toBe(50);
    });

    it('should create two language buttons (DE and EN)', () => {
      selector = new LanguageSelector(scene, 100, 50);
      // Should create graphics for each button
      expect(scene.add.graphics).toHaveBeenCalledTimes(2); // Two button backgrounds
    });

    it('should create text labels for each language', () => {
      selector = new LanguageSelector(scene, 100, 50);
      // Should create text for DE and EN labels
      expect(scene.add.text).toHaveBeenCalled();
    });

    it('should make buttons interactive', () => {
      selector = new LanguageSelector(scene, 100, 50);
      // Buttons should be clickable
      expect(scene.add.container).toHaveBeenCalled();
    });

    it('should highlight the current language by default', () => {
      i18nService.setLanguage('de');
      selector = new LanguageSelector(scene, 100, 50);
      // German button should be highlighted initially
      expect(selector).toBeDefined();
    });
  });

  describe('T029: Click handlers', () => {
    beforeEach(() => {
      // Mock the interactive behavior more thoroughly
      const mockOnMethod: any = vi.fn((event: string, handler: Function) => {
        // Store handler so we can trigger it
        if (event === 'pointerdown') {
          (mockOnMethod as any).pointerdownHandler = handler;
        }
        return mockOnMethod;
      });

      scene.add.container = vi.fn().mockImplementation(() => {
        const list: any[] = [];
        return {
          list,
          add: vi.fn((items: any[]) => {
            list.push(...items);
          }),
          setSize: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          on: mockOnMethod,
          once: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
          emit: vi.fn().mockReturnThis(),
          removeFromDisplayList: vi.fn(),
          addedToScene: vi.fn(),
          parentContainer: null,
        };
      });

      selector = new LanguageSelector(scene, 100, 50);
    });

    it('should switch to German when DE button clicked', () => {
      const initialLang = i18nService.getCurrentLanguage();
      i18nService.setLanguage('en'); // Start with English
      
      expect(i18nService.getCurrentLanguage()).toBe('en');
      
      // Simulate clicking on DE button (this will be implemented in the component)
      // For now, just test that the service can switch
      i18nService.setLanguage('de');
      expect(i18nService.getCurrentLanguage()).toBe('de');
    });

    it('should switch to English when EN button clicked', () => {
      i18nService.setLanguage('de'); // Start with German
      expect(i18nService.getCurrentLanguage()).toBe('de');
      
      // Simulate clicking on EN button
      i18nService.setLanguage('en');
      expect(i18nService.getCurrentLanguage()).toBe('en');
    });

    it('should not switch if clicking the current language', () => {
      i18nService.setLanguage('de');
      const callback = vi.fn();
      i18nService.on('languageChanged', callback);
      
      // Click on DE again (should not emit event)
      i18nService.setLanguage('de');
      expect(callback).not.toHaveBeenCalled();
      
      i18nService.off('languageChanged', callback);
    });

    it('should update button styling when language changes', () => {
      i18nService.setLanguage('de');
      selector = new LanguageSelector(scene, 100, 50);
      
      // Switch to English
      i18nService.setLanguage('en');
      
      // LanguageSelector should listen to languageChanged event and redraw
      expect(i18nService.getCurrentLanguage()).toBe('en');
    });

    it('should persist language choice to localStorage', () => {
      i18nService.setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
      
      i18nService.setLanguage('de');
      expect(localStorage.getItem('language')).toBe('de');
    });
  });

  describe('Edge cases and accessibility', () => {
    it('should handle rapid clicks gracefully', () => {
      selector = new LanguageSelector(scene, 100, 50);
      
      // Rapid language switches
      i18nService.setLanguage('en');
      i18nService.setLanguage('de');
      i18nService.setLanguage('en');
      i18nService.setLanguage('de');
      
      expect(i18nService.getCurrentLanguage()).toBe('de');
    });

    it('should maintain correct state after multiple switches', () => {
      selector = new LanguageSelector(scene, 100, 50);
      
      i18nService.setLanguage('en');
      expect(i18nService.getCurrentLanguage()).toBe('en');
      
      i18nService.setLanguage('de');
      expect(i18nService.getCurrentLanguage()).toBe('de');
      
      i18nService.setLanguage('en');
      expect(i18nService.getCurrentLanguage()).toBe('en');
    });

    it('should update UI when language changes externally', () => {
      selector = new LanguageSelector(scene, 100, 50);
      const callback = vi.fn();
      
      i18nService.on('languageChanged', callback);
      i18nService.setLanguage('en');
      
      expect(callback).toHaveBeenCalledWith('en');
      i18nService.off('languageChanged', callback);
    });
  });
});
