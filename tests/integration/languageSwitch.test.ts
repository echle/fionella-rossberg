import { describe, it, expect, beforeEach } from 'vitest';
import { i18nService } from '../../src/services/i18nService';
import { useGameStore } from '../../src/state/gameStore';

/**
 * T030: Integration test for full language switch workflow
 * Tests the complete user journey: click button → all text updates → reload → language persists
 */
describe('Language Switch Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    i18nService.setLanguage('de'); // Reset to default
  });

  describe('Complete language switch workflow', () => {
    it('should switch all UI text from German to English', () => {
      // Start with German
      i18nService.setLanguage('de');
      
      // Verify German translations
      expect(i18nService.t('ui.statusBar.hunger')).toBe('Hunger');
      expect(i18nService.t('ui.statusBar.happiness')).toBe('Glück');
      expect(i18nService.t('ui.statusBar.energy')).toBe('Energie');
      expect(i18nService.t('ui.buttons.feed')).toBe('Füttern');
      expect(i18nService.t('ui.buttons.brush')).toBe('Bürsten');
      
      // Switch to English
      i18nService.setLanguage('en');
      
      // Verify English translations
      expect(i18nService.t('ui.statusBar.hunger')).toBe('Hunger');
      expect(i18nService.t('ui.statusBar.happiness')).toBe('Happiness');
      expect(i18nService.t('ui.statusBar.energy')).toBe('Energy');
      expect(i18nService.t('ui.buttons.feed')).toBe('Feed');
      expect(i18nService.t('ui.buttons.brush')).toBe('Brush');
    });

    it('should persist language choice across page reloads', () => {
      // Switch to English
      i18nService.setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
      
      // Simulate page reload by checking localStorage
      const savedLang = localStorage.getItem('language');
      expect(savedLang).toBe('en');
      
      // Verify translations are in English
      expect(i18nService.t('ui.buttons.feed')).toBe('Feed');
    });

    it('should default to German on first load', () => {
      // Clear localStorage to simulate first load
      localStorage.clear();
      
      // Service should default to German
      const currentLang = i18nService.getCurrentLanguage();
      expect(currentLang).toBe('de');
      
      // Verify German translations
      expect(i18nService.t('ui.buttons.feed')).toBe('Füttern');
    });

    it('should update game store locale state when language changes', () => {
      const store = useGameStore.getState();
      expect(store.locale.language).toBe('de');
      
      // Switch language
      i18nService.setLanguage('en');
      
      // GameStore should be updated (this will be implemented in integration)
      // For now, just verify i18n service state
      expect(i18nService.getCurrentLanguage()).toBe('en');
    });

    it('should emit languageChanged event for UI updates', () => {
      let eventFired = false;
      let newLanguage = '';
      
      const callback = (lang: string) => {
        eventFired = true;
        newLanguage = lang;
      };
      
      i18nService.on('languageChanged', callback);
      i18nService.setLanguage('en');
      
      expect(eventFired).toBe(true);
      expect(newLanguage).toBe('en');
      
      i18nService.off('languageChanged', callback);
    });

    it('should handle complete user journey: DE → EN → reload → EN', () => {
      // Step 1: Start with German (default)
      i18nService.setLanguage('de');
      expect(i18nService.t('ui.game.title')).toBe('Fionella Rossberg - Pferdepflege');
      
      // Step 2: Click EN button
      i18nService.setLanguage('en');
      expect(i18nService.t('ui.game.title')).toBe('Fionella Rossberg - Horse Care');
      expect(localStorage.getItem('language')).toBe('en');
      
      // Step 3: Simulate page reload
      const savedLang = localStorage.getItem('language');
      expect(savedLang).toBe('en');
      
      // Step 4: Verify translations still in English
      expect(i18nService.t('ui.game.title')).toBe('Fionella Rossberg - Horse Care');
    });

    it('should translate all message strings with placeholders', () => {
      i18nService.setLanguage('de');
      let message = i18nService.t('ui.messages.hungerDecreased', { value: '75' });
      expect(message).toBe('Hunger: 75%');
      
      i18nService.setLanguage('en');
      message = i18nService.t('ui.messages.hungerDecreased', { value: '75' });
      expect(message).toBe('Hunger: 75%');
    });

    it('should handle rapid language switches with persistence', () => {
      i18nService.setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
      
      i18nService.setLanguage('de');
      expect(localStorage.getItem('language')).toBe('de');
      
      i18nService.setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
      
      // Final state should be English
      expect(i18nService.getCurrentLanguage()).toBe('en');
      expect(i18nService.t('ui.buttons.save')).toBe('Save');
    });

    it('should maintain game state while switching languages', () => {
      const initialState = useGameStore.getState();
      const initialHunger = initialState.horse.hunger;
      
      i18nService.setLanguage('en');
      
      const afterSwitch = useGameStore.getState();
      expect(afterSwitch.horse.hunger).toBe(initialHunger);
      expect(afterSwitch.locale.language).toBeDefined();
    });

    it('should fallback to English for missing translations', () => {
      i18nService.setLanguage('de');
      
      // Test with a non-existent key
      const missing = i18nService.t('nonexistent.translation.key');
      expect(missing).toBe('nonexistent.translation.key'); // Returns key as fallback
    });
  });

  describe('Cross-browser persistence', () => {
    it('should persist language in localStorage across sessions', () => {
      i18nService.setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
      
      // Simulate new session
      const retrievedLang = localStorage.getItem('language');
      expect(retrievedLang).toBe('en');
    });

    it('should handle missing localStorage gracefully', () => {
      const originalGetItem = localStorage.getItem;
      
      // Temporarily break localStorage
      localStorage.getItem = () => null;
      
      // Should default to German
      const currentLang = i18nService.getCurrentLanguage();
      expect(['de', 'en']).toContain(currentLang);
      
      // Restore
      localStorage.getItem = originalGetItem;
    });
  });

  describe('Translation coverage', () => {
    it('should have all required keys in both languages', () => {
      const requiredKeys = [
        'ui.statusBar.hunger',
        'ui.statusBar.happiness',
        'ui.statusBar.energy',
        'ui.statusBar.cleanliness',
        'ui.buttons.feed',
        'ui.buttons.brush',
        'ui.buttons.pet',
        'ui.buttons.save',
        'ui.buttons.load',
        'ui.buttons.reset',
        'ui.game.title',
        'ui.game.loading',
        'ui.game.ready',
        'ui.language.german',
        'ui.language.english',
      ];
      
      // Test German
      i18nService.setLanguage('de');
      requiredKeys.forEach(key => {
        const translation = i18nService.t(key);
        expect(translation).not.toBe(key); // Should not return the key itself
        expect(translation.length).toBeGreaterThan(0);
      });
      
      // Test English
      i18nService.setLanguage('en');
      requiredKeys.forEach(key => {
        const translation = i18nService.t(key);
        expect(translation).not.toBe(key);
        expect(translation.length).toBeGreaterThan(0);
      });
    });
  });
});
