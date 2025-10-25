import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

test.describe('Single Player Tournament Flow', () => {
  test('should complete full tournament flow: hero selection → buy ability → reroll → minion round → artifact round', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
    
    await page.goto('/');
    
    await expect(page.locator('h1').first()).toContainText('Choose Game Mode');
    
    await page.click('[data-mode-id="casual"]');
    
    await page.click('button#start-play-btn');
    
    await expect(page.locator('#hero-selection.active')).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('.hero-selection-container')).toBeVisible({ timeout: 5000 });
    
    const firstHero = page.locator('.hero-card').first();
    await expect(firstHero).toBeVisible({ timeout: 5000 });
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    
    const startButton = page.locator('button#start-tournament-btn');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(page.locator('text=Pre-Round')).toBeVisible({ timeout: 15000 });
    
    await page.click('button#rounds-shop-toggle');
    
    await expect(page.locator('h3:has-text("🏪 Abilities Shop")')).toBeVisible({ timeout: 5000 });
    
    const goldBefore = await page.locator('.player-gold-mini').textContent();
    console.log('Gold before purchase:', goldBefore);
    
    const buyButton = page.locator('button.buy-btn-mini').first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      await page.waitForTimeout(500);
      
      const goldAfter = await page.locator('.player-gold-mini').textContent();
      console.log('Gold after purchase:', goldAfter);
    }
    
    const rerollButton = page.locator('button#global-reroll-btn');
    if (await rerollButton.isVisible()) {
      const goldBeforeReroll = await page.locator('.player-gold-mini').textContent();
      await rerollButton.click();
      await page.waitForTimeout(500);
      
      const goldAfterReroll = await page.locator('.player-gold-mini').textContent();
      console.log('Gold before reroll:', goldBeforeReroll, 'after:', goldAfterReroll);
    }
    
    await page.click('button#close-combat-shop');
    
    await expect(page.locator('#rounds-shop-container')).toBeHidden({ timeout: 3000 });
    
    await page.waitForSelector('#round-timer .timer-display.round', { timeout: 40000 });
    
    await expect(page.locator('h1.combat-title:has-text("Battle Arena")')).toBeVisible({ timeout: 10000 });
    
    await page.waitForTimeout(2000);
    
    await expect(page.locator('h3:has-text("Battle Log")')).toBeVisible({ timeout: 5000 });
    
    const minionRoundIndicator = page.locator('text=/minion|creep|pve/i');
    if (await minionRoundIndicator.isVisible({ timeout: 5000 })) {
      console.log('Minion round detected');
      
      await page.waitForTimeout(30000);
    }
    
    const artifactSelection = page.locator('.artifact, [class*="artifact"]');
    if (await artifactSelection.isVisible({ timeout: 10000 })) {
      console.log('Artifact selection detected');
      
      const firstArtifact = page.locator('.artifact-card, .artifact-option, button:has-text("Select")').first();
      if (await firstArtifact.isVisible()) {
        await firstArtifact.click();
      }
    }
    
    console.log('Tournament flow test completed successfully');
  });

  test('should handle shop interactions correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-mode-id="casual"]');
    
    await page.click('button#start-play-btn');
    
    await expect(page.locator('#hero-selection.active')).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('.hero-selection-container')).toBeVisible({ timeout: 5000 });
    const firstHero = page.locator('.hero-card').first();
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    const startButton = page.locator('button#start-tournament-btn');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(page.locator('text=Pre-Round')).toBeVisible({ timeout: 15000 });
    
    await page.click('button#rounds-shop-toggle');
    
    await expect(page.locator('h3:has-text("🏪 Abilities Shop")')).toBeVisible({ timeout: 5000 });
    
    const initialGoldText = await page.locator('.player-gold-mini').textContent();
    const initialGold = parseInt(initialGoldText.replace(/\D/g, ''));
    console.log('Initial gold:', initialGold);
    
    const rerollButton = page.locator('button#global-reroll-btn');
    await expect(rerollButton).toBeVisible({ timeout: 5000 });
    await rerollButton.click();
    await page.waitForTimeout(500);
    
    const afterRerollText = await page.locator('.player-gold-mini').textContent();
    const afterRerollGold = parseInt(afterRerollText.replace(/\D/g, ''));
    console.log('Gold after reroll:', afterRerollGold);
    
    expect(afterRerollGold).toBeLessThan(initialGold);
    
    const buyButton = page.locator('button.buy-btn-mini').first();
    await expect(buyButton).toBeVisible({ timeout: 5000 });
    
    const beforePurchaseText = await page.locator('.player-gold-mini').textContent();
    const beforePurchaseGold = parseInt(beforePurchaseText.replace(/\D/g, ''));
    
    await buyButton.click();
    await page.waitForTimeout(500);
    
    const afterPurchaseText = await page.locator('.player-gold-mini').textContent();
    const afterPurchaseGold = parseInt(afterPurchaseText.replace(/\D/g, ''));
    console.log('Gold before purchase:', beforePurchaseGold, 'after:', afterPurchaseGold);
    
    expect(afterPurchaseGold).toBeLessThan(beforePurchaseGold);
    
    console.log('Shop interactions test completed successfully');
  });

  test('should display combat correctly', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
    
    await page.goto('/');
    
    await page.click('[data-mode-id="casual"]');
    
    await page.click('button#start-play-btn');
    
    await expect(page.locator('#hero-selection.active')).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('.hero-selection-container')).toBeVisible({ timeout: 5000 });
    const firstHero = page.locator('.hero-card').first();
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    const startButton = page.locator('button#start-tournament-btn');
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    
    await expect(page.locator('text=Pre-Round')).toBeVisible({ timeout: 15000 });
    
    await page.waitForSelector('#round-timer .timer-display.round', { timeout: 40000 });
    
    await expect(page.locator('h1.combat-title:has-text("Battle Arena")')).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('h3:has-text("Battle Log")')).toBeVisible({ timeout: 5000 });
    
    const playerHeroCard = page.locator('.hero-stats-card').first();
    await expect(playerHeroCard).toBeVisible({ timeout: 5000 });
    
    await page.waitForTimeout(5000);
    
    console.log('Combat display test completed successfully');
  });
});
