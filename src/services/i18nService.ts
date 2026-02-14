/**
 * Internationalization (i18n) Service
 * Lightweight custom implementation for bilingual support (DE/EN)
 * 
 * @feature 005-internationalization-i18n
 * @singleton
 */

import type { Translation, LanguageConfig } from '../state/types';
import deTranslations from '../locales/de.json';
import enTranslations from '../locales/en.json';

type EventCallback = (language: string) => void;

/**
 * Available languages configuration
 */
const LANGUAGES: LanguageConfig[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', isDefault: true },
  { code: 'en', name: 'English', flag: '🇬🇧', isDefault: false }
];

const STORAGE_KEY = 'language';

class I18nService {
  private currentLang: string;
  private translations: Record<string, Translation>;
  private flatTranslations: Record<string, Record<string, string>> = {};
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    // Load translations
    this.translations = {
      de: deTranslations as Translation,
      en: enTranslations as Translation
    };

    // Flatten translations for O(1) lookup
    this.flatTranslations = {
      de: this.flattenObject(this.translations.de),
      en: this.flattenObject(this.translations.en)
    };

    // Initialize language from localStorage or default
    const savedLang = this.loadLanguageFromStorage();
    const defaultLang = LANGUAGES.find(l => l.isDefault)?.code || 'de';
    this.currentLang = savedLang || defaultLang;
  }

  /**
   * Flatten nested translation object for fast lookups
   * Converts { ui: { buttons: { feed: "Füttern" } } } 
   * to { "ui.buttons.feed": "Füttern" }
   */
  private flattenObject(obj: Translation, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        result[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, this.flattenObject(value, fullKey));
      }
    }

    return result;
  }

  /**
   * Load language preference from localStorage
   */
  private loadLanguageFromStorage(): string | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[i18n] Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Save language preference to localStorage
   */
  private saveLanguageToStorage(lang: string): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.warn('[i18n] Failed to write to localStorage:', error);
    }
  }

  /**
   * Get translated text for a given key
   * 
   * @param key - Translation key (e.g., 'ui.buttons.feed')
   * @param params - Optional parameters for placeholders
   * @returns Translated string with placeholders replaced
   * 
   * @example
   * i18nService.t('ui.buttons.feed') // "Füttern" (DE) or "Feed" (EN)
   * i18nService.t('ui.messages.hunger', { value: 75 }) // "Hunger: 75%"
   */
  t(key: string, params?: Record<string, any>): string {
    // Try current language
    let text = this.flatTranslations[this.currentLang]?.[key];

    // Fallback to English if missing
    if (!text && this.currentLang !== 'en') {
      text = this.flatTranslations.en?.[key];
      if (text) {
        console.warn(`[i18n] Missing translation for key "${key}" in language "${this.currentLang}", using English fallback`);
      }
    }

    // Fallback to key itself if both languages missing
    if (!text) {
      console.warn(`[i18n] Missing translation for key "${key}" in all languages`);
      text = key;
    }

    // Replace placeholders if params provided
    if (params) {
      text = this.replacePlaceholders(text, params);
    }

    return text;
  }

  /**
   * Replace placeholders in translation string
   * Supports {variableName} syntax
   */
  private replacePlaceholders(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Set the current language
   * 
   * @param languageCode - Language code ('de' or 'en')
   * @throws Error if invalid language code
   * 
   * @example
   * i18nService.setLanguage('en');
   */
  setLanguage(languageCode: string): void {
    // Validate language code
    const validLanguages = LANGUAGES.map(l => l.code);
    if (!validLanguages.includes(languageCode)) {
      console.warn(`[i18n] Invalid language code "${languageCode}", defaulting to "de"`);
      languageCode = 'de';
    }

    // Skip if already current language
    if (this.currentLang === languageCode) {
      return;
    }

    // Update language
    this.currentLang = languageCode;

    // Persist to storage
    this.saveLanguageToStorage(languageCode);

    // Emit event
    this.emit('languageChanged', languageCode);
  }

  /**
   * Get the current language code
   * 
   * @returns Current language code
   */
  getCurrentLanguage(): string {
    return this.currentLang;
  }

  /**
   * Get all available language codes
   * 
   * @returns Array of language codes
   */
  getAvailableLanguages(): string[] {
    return LANGUAGES.map(l => l.code);
  }

  /**
   * Get language configurations
   * 
   * @returns Array of language configs
   */
  getLanguageConfigs(): LanguageConfig[] {
    return [...LANGUAGES];
  }

  /**
   * Subscribe to language change events
   * 
   * @param event - Event name ('languageChanged')
   * @param callback - Callback function
   * 
   * @example
   * i18nService.on('languageChanged', (lang) => console.log(`Language changed to ${lang}`));
   */
  on(event: 'languageChanged', callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from language change events
   * 
   * @param event - Event name ('languageChanged')
   * @param callback - Callback function
   */
  off(event: 'languageChanged', callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: string, language: string): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(language);
        } catch (error) {
          console.error(`[i18n] Error in event listener for "${event}":`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const i18nService = new I18nService();
