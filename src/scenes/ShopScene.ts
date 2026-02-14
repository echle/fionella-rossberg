import Phaser from 'phaser';
import { useGameStore } from '../state/gameStore';
import { purchaseItem, canAfford } from '../state/actions';
import { SHOP_ITEMS } from '../config/gameConstants';
import { i18nService } from '../services/i18nService';

/**
 * ShopScene - Modal overlay for purchasing items with currency
 * @feature 006-economy-game-clock
 */
export class ShopScene extends Phaser.Scene {
  private itemCards: Phaser.GameObjects.Container[] = [];
  private buyButtons: Phaser.GameObjects.Text[] = [];
  private priceTexts: Phaser.GameObjects.Text[] = [];
  private unsubscribe?: () => void;

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Container for all shop elements (for animation)
    const shopContainer = this.add.container(width / 2, height / 2);

    // T031: Semi-transparent black overlay background
    const overlay = this.add.rectangle(-width / 2, -height / 2, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setInteractive(); // Prevent clicks from going through to game
    shopContainer.add(overlay);

    // T032: Shop title
    const titleText = this.add.text(0, -height / 2 + 60, i18nService.t('ui.shop.title'), {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5);
    shopContainer.add(titleText);

    // T037: Close button (X) in top-right
    const closeButton = this.add.text(width / 2 - 30, -height / 2 + 30, '✕', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => {
      this.closeShop(shopContainer);
    });

    // Hover effect for close button
    closeButton.on('pointerover', () => {
      closeButton.setScale(1.2);
      closeButton.setColor('#ff6b6b');
    });
    closeButton.on('pointerout', () => {
      closeButton.setScale(1);
      closeButton.setColor('#ffffff');
    });
    shopContainer.add(closeButton);

    // T079: Create responsive item grid layout
    // Adjust columns based on screen width
    let itemsPerRow = 3; // Default: 3 columns for desktop
    if (this.scale.width < 768) {
      itemsPerRow = 2; // 2 columns for tablets
    }
    if (this.scale.width < 480) {
      itemsPerRow = 1; // 1 column for mobile
    }

    const cardWidth = 140;
    const cardHeight = 180;
    const cardSpacing = 20;
    const gridWidth = itemsPerRow * cardWidth + (itemsPerRow - 1) * cardSpacing;
    const startX = -(gridWidth / 2);
    const startY = -height / 2 + 140;

    // T034: Render shop items as cards
    SHOP_ITEMS.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const cardX = startX + col * (cardWidth + cardSpacing) + cardWidth / 2;
      const cardY = startY + row * (cardHeight + cardSpacing);

      this.createItemCard(cardX, cardY, cardWidth, cardHeight, item, shopContainer);
    });

    // Feature 006 T071: Scale-in animation on open (300ms, ease-out)
    shopContainer.setScale(0);
    this.tweens.add({
      targets: shopContainer,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // T036: Subscribe to currency changes for real-time affordability updates
    this.unsubscribe = useGameStore.subscribe(
      () => {
        this.updateAffordability();
      }
    );

    // Initial affordability check
    this.updateAffordability();

    // Clean up subscriptions when scene shuts down
    this.events.once('shutdown', () => {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    });
  }

  /**
   * T034: Create an item card with icon, name, price, and buy button
   */
  private createItemCard(
    x: number,
    y: number,
    width: number,
    height: number,
    item: typeof SHOP_ITEMS[0],
    parentContainer: Phaser.GameObjects.Container
  ): void {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, 0x2a2a2a, 0.95);
    bg.setStrokeStyle(2, 0x4a4a4a);
    bg.setInteractive({ useHandCursor: true });

    // Feature 006 T073: Hover effect on card
    bg.on('pointerover', () => {
      container.setScale(1.05);
      bg.setStrokeStyle(3, 0xFFD700); // Gold highlight
    });

    bg.on('pointerout', () => {
      container.setScale(1);
      bg.setStrokeStyle(2, 0x4a4a4a);
    });

    // Item icon
    const icon = this.add.text(0, -50, item.icon, {
      fontSize: '48px',
    });
    icon.setOrigin(0.5);

    // Item name (translated)
    const nameText = this.add.text(0, 0, i18nService.t(item.nameKey), {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 20 },
    });
    nameText.setOrigin(0.5);

    // Price display
    const priceText = this.add.text(0, 30, `💰 ${item.price}`, {
      fontSize: '18px',
      color: '#FFD700',
      fontStyle: 'bold',
    });
    priceText.setOrigin(0.5);
    this.priceTexts.push(priceText);

    // T035: Buy button with click handler
    const buyButton = this.add.text(0, 65, i18nService.t('ui.shop.buy'), {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { x: 12, y: 6 },
    });
    buyButton.setOrigin(0.5);
    buyButton.setInteractive({ useHandCursor: true });
    buyButton.setData('itemId', item.id);
    buyButton.setData('price', item.price);

    // T035: Buy button click handler
    buyButton.on('pointerdown', () => {
      this.handlePurchase(item.id);
    });

    // Hover effects
    buyButton.on('pointerover', () => {
      if (buyButton.getData('canAfford') !== false) {
        buyButton.setScale(1.1);
      }
    });
    buyButton.on('pointerout', () => {
      buyButton.setScale(1);
    });

    this.buyButtons.push(buyButton);

    container.add([bg, icon, nameText, priceText, buyButton]);
    this.itemCards.push(container);
    parentContainer.add(container);
  }

  /**
   * T035: Handle purchase with success/error feedback
   */
  private handlePurchase(itemId: string): void {
    const success = purchaseItem(itemId);

    if (success) {
      // T080: Haptic feedback on mobile (success: short burst)
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]); // Short-long-short pattern
      }

      // T074: Show checkmark animation
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      // T075: Find purchased item for floating notification
      const purchasedItem = SHOP_ITEMS.find((item) => item.id === itemId);
      if (purchasedItem) {
        // Floating "+[amount] [icon]" notification
        const rewardText = `+${purchasedItem.rewardAmount} ${purchasedItem.rewardType === 'carrot' ? '🥕' : purchasedItem.rewardType === 'brush' ? '🪥' : '💰'}`;
        const floatingNotif = this.add.text(centerX + 100, centerY, rewardText, {
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#FFD700',
          stroke: '#000000',
          strokeThickness: 3,
        });
        floatingNotif.setOrigin(0.5);

        // Float upward with fade-out
        this.tweens.add({
          targets: floatingNotif,
          y: centerY - 120,
          alpha: 0,
          duration: 1500,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            floatingNotif.destroy();
          },
        });
      }

      // T076: Sparkle particle burst
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8; // Evenly distributed angles
        const distance = 80 + Math.random() * 40; // Random distance 80-120px
        const sparkle = this.add.text(centerX, centerY, '✨', {
          fontSize: '20px',
        });
        sparkle.setOrigin(0.5);
        sparkle.setAlpha(0.8);

        // Calculate target position
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;

        // Animate sparkle outward with fade
        this.tweens.add({
          targets: sparkle,
          x: targetX,
          y: targetY,
          alpha: 0,
          scale: 0.3,
          duration: 600,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            sparkle.destroy();
          },
        });
      }

      // Checkmark (✓) with scale animation
      const checkmark = this.add.text(centerX, centerY - 150, '✓', {
        fontSize: '64px',
        color: '#4CAF50',
        stroke: '#ffffff',
        strokeThickness: 4,
      });
      checkmark.setOrigin(0.5);
      checkmark.setScale(0);

      // Checkmark scale-in animation (elastic ease)
      this.tweens.add({
        targets: checkmark,
        scale: 1.2,
        duration: 400,
        ease: 'Elastic.easeOut',
        onComplete: () => {
          // Hold briefly, then fade out
          this.tweens.add({
            targets: checkmark,
            alpha: 0,
            duration: 300,
            delay: 800,
            ease: 'Power2',
            onComplete: () => {
              checkmark.destroy();
            },
          });
        },
      });

      const successText = this.add.text(centerX, centerY - 100, i18nService.t('ui.shop.purchaseSuccess'), {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#4CAF50',
        stroke: '#000000',
        strokeThickness: 3,
      });
      successText.setOrigin(0.5);

      // Fade out success message
      this.tweens.add({
        targets: successText,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          successText.destroy();
        },
      });
    } else {
      // T080: Haptic feedback on mobile (error: single strong pulse)
      if ('vibrate' in navigator) {
        navigator.vibrate(200); // Single 200ms vibration for error
      }

      // T078: Show "too expensive" feedback
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;

      // Red X icon with shake
      const errorIcon = this.add.text(centerX, centerY - 150, '❌', {
        fontSize: '48px',
      });
      errorIcon.setOrigin(0.5);

      // Shake the icon
      this.tweens.add({
        targets: errorIcon,
        x: centerX + 12,
        duration: 50,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          this.tweens.add({
            targets: errorIcon,
            alpha: 0,
            duration: 300,
            delay: 400,
            onComplete: () => {
              errorIcon.destroy();
            },
          });
        },
      });

      const errorText = this.add.text(centerX, centerY - 100, i18nService.t('ui.shop.insufficientFunds'), {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ff6b6b',
        stroke: '#000000',
        strokeThickness: 3,
      });
      errorText.setOrigin(0.5);

      // Shake animation
      this.tweens.add({
        targets: errorText,
        x: centerX + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });

      // Fade out error message
      this.tweens.add({
        targets: errorText,
        alpha: 0,
        duration: 2000,
        delay: 500,
        ease: 'Power2',
        onComplete: () => {
          errorText.destroy();
        },
      });
    }
  }

  /**
   * T036: Update button states based on affordability
   */
  private updateAffordability(): void {
    // T077: Update button and price text colors based on affordability
    this.buyButtons.forEach((button, index) => {
      const price = button.getData('price') as number;
      const affordable = canAfford(price);
      button.setData('canAfford', affordable);

      if (affordable) {
        button.setStyle({ backgroundColor: '#4CAF50' });
        button.setAlpha(1);
        // Price text: White when affordable
        if (this.priceTexts[index]) {
          this.priceTexts[index].setColor('#FFD700'); // Gold for affordable
        }
      } else {
        button.setStyle({ backgroundColor: '#666666' });
        button.setAlpha(0.5);
        // Price text: Red when too expensive
        if (this.priceTexts[index]) {
          this.priceTexts[index].setColor('#FF4444'); // Red for unaffordable
        }
      }
    });
  }

  /**
   * T037: Close shop and return to game
   */
  private closeShop(): void {
    this.scene.stop('ShopScene');
  }
}
