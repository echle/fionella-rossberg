import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore, DEFAULT_FEEDING_STATE } from '../../src/state/gameStore';
import { 
  earnCurrency, 
  getCurrencyBalance, 
  spendCurrency, 
  canAfford,
  purchaseItem 
} from '../../src/state/actions';
import { CURRENCY, INITIAL_STATUS, INITIAL_INVENTORY } from '../../src/config/gameConstants';
import { saveSystem } from '../../src/systems/SaveSystem';

// Mock saveSystem to prevent LocalStorage writes during tests
vi.mock('../../src/systems/SaveSystem', () => ({
  saveSystem: {
    save: vi.fn(),
    load: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('Economy Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store to clean state with initial currency
    useGameStore.setState({
      version: '1.3.0',
      timestamp: Date.now(),
      horse: {
        hunger: INITIAL_STATUS.HUNGER,
        cleanliness: INITIAL_STATUS.CLEANLINESS,
        happiness: INITIAL_STATUS.HAPPINESS,
      },
      inventory: {
        carrots: INITIAL_INVENTORY.CARROTS,
        brushUses: INITIAL_INVENTORY.BRUSH_USES,
      },
      ui: {
        selectedTool: null,
        activeAnimation: null,
        lastInteractionTime: 0,
      },
      feeding: DEFAULT_FEEDING_STATE,
      locale: {
        language: 'de',
      },
      currency: CURRENCY.STARTING_BALANCE,
      gameClock: {
        startTimestamp: null,
      },
      giftBoxes: [],
      isGameOver: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('earnCurrency', () => {
    it('should add currency to balance', () => {
      earnCurrency(10);
      expect(getCurrencyBalance()).toBe(60); // 50 + 10
    });

    it('should cap at MAX_BALANCE', () => {
      useGameStore.setState({ ...useGameStore.getState(), currency: CURRENCY.MAX_BALANCE - 5 });
      earnCurrency(10);
      expect(getCurrencyBalance()).toBe(CURRENCY.MAX_BALANCE);
    });

    it('should ignore invalid amounts (negative)', () => {
      earnCurrency(-10);
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE);
    });

    it('should ignore invalid amounts (non-integer)', () => {
      earnCurrency(5.5);
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE);
    });

    it('should auto-save after earning currency', () => {
      earnCurrency(10);
      expect(saveSystem.save).toHaveBeenCalledTimes(1);
    });

    it('should handle earning exactly to MAX_BALANCE', () => {
      const startAmount = CURRENCY.MAX_BALANCE - 100;
      useGameStore.setState({ ...useGameStore.getState(), currency: startAmount });
      earnCurrency(100);
      expect(getCurrencyBalance()).toBe(CURRENCY.MAX_BALANCE);
    });
  });

  describe('getCurrencyBalance', () => {
    it('should return current currency balance', () => {
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE);
    });

    it('should reflect updated balance', () => {
      useGameStore.setState({ ...useGameStore.getState(), currency: 123 });
      expect(getCurrencyBalance()).toBe(123);
    });
  });

  describe('spendCurrency', () => {
    it('should deduct currency from balance', () => {
      const result = spendCurrency(10);
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(40); // 50 - 10
    });

    it('should fail if insufficient funds', () => {
      const result = spendCurrency(100);
      expect(result).toBe(false);
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE); // Unchanged
    });

    it('should allow spending exact balance', () => {
      const result = spendCurrency(CURRENCY.STARTING_BALANCE);
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(0);
    });

    it('should reject negative amounts', () => {
      const result = spendCurrency(-10);
      expect(result).toBe(false);
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE);
    });

    it('should reject non-integer amounts', () => {
      const result = spendCurrency(5.5);
      expect(result).toBe(false);
      expect(getCurrencyBalance()).toBe(CURRENCY.STARTING_BALANCE);
    });

    it('should auto-save after spending currency', () => {
      spendCurrency(10);
      expect(saveSystem.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('canAfford', () => {
    it('should return true when balance is sufficient', () => {
      expect(canAfford(40)).toBe(true);
      expect(canAfford(50)).toBe(true);
    });

    it('should return false when balance is insufficient', () => {
      expect(canAfford(51)).toBe(false);
      expect(canAfford(100)).toBe(false);
    });

    it('should handle 0 price', () => {
      expect(canAfford(0)).toBe(true);
    });

    it('should reflect updated balance', () => {
      useGameStore.setState({ ...useGameStore.getState(), currency: 100 });
      expect(canAfford(75)).toBe(true);
      expect(canAfford(150)).toBe(false);
    });
  });

  describe('purchaseItem', () => {
    beforeEach(() => {
      // Give player enough currency for all items
      useGameStore.setState({ ...useGameStore.getState(), currency: 100 });
    });

    it('should purchase carrot_single successfully', () => {
      const initialCarrots = useGameStore.getState().inventory.carrots;
      const result = purchaseItem('carrot_single');
      
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(95); // 100 - 5
      expect(useGameStore.getState().inventory.carrots).toBe(initialCarrots + 1);
    });

    it('should purchase brush_refill successfully', () => {
      const initialBrushes = useGameStore.getState().inventory.brushUses;
      const result = purchaseItem('brush_refill');
      
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(92); // 100 - 8
      expect(useGameStore.getState().inventory.brushUses).toBe(initialBrushes + 50);
    });

    it('should purchase carrot_bundle successfully', () => {
      const initialCarrots = useGameStore.getState().inventory.carrots;
      const result = purchaseItem('carrot_bundle');
      
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(85); // 100 - 15
      expect(useGameStore.getState().inventory.carrots).toBe(initialCarrots + 5);
    });

    it('should fail with insufficient funds', () => {
      useGameStore.setState({ ...useGameStore.getState(), currency: 4 }); // Less than cheapest item (5)
      const result = purchaseItem('carrot_single');
      
      expect(result).toBe(false);
      expect(getCurrencyBalance()).toBe(4); // Unchanged
    });

    it('should fail with invalid item ID', () => {
      const result = purchaseItem('invalid_item');
      expect(result).toBe(false);
      expect(getCurrencyBalance()).toBe(100); // Unchanged
    });

    it('should auto-save after successful purchase', () => {
      purchaseItem('carrot_single');
      // Save is called twice: once for spendCurrency, once for reward grant
      expect(saveSystem.save).toHaveBeenCalled();
    });

    it('should handle purchasing all carrots with exact currency', () => {
      useGameStore.setState({ ...useGameStore.getState(), currency: 5 });
      const initialCarrots = useGameStore.getState().inventory.carrots;
      
      const result = purchaseItem('carrot_single');
      expect(result).toBe(true);
      expect(getCurrencyBalance()).toBe(0);
      expect(useGameStore.getState().inventory.carrots).toBe(initialCarrots + 1);
    });
  });
});
