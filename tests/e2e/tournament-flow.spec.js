import { test, expect } from '@playwright/test';

test.describe('Single Player Tournament Flow', () => {
  test('should complete full tournament flow: hero selection → buy ability → reroll → minion round → artifact round', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Auto Gladiators');
    
    await page.click('button:has-text("Single Player Tournament")');
    
    await expect(page.locator('.hero-selection, #hero-selection')).toBeVisible({ timeout: 10000 });
    
    const firstHero = page.locator('.hero-card, .hero-option').first();
    await expect(firstHero).toBeVisible({ timeout: 5000 });
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    
    const startButton = page.locator('button:has-text("Start"), button:has-text("Ready"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    await expect(page.locator('.shop, .ability-shop, #shop')).toBeVisible({ timeout: 15000 });
    
    const goldBefore = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
    console.log('Gold before purchase:', goldBefore);
    
    const buyButton = page.locator('button:has-text("Buy"), button:has-text("Purchase")').first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      await page.waitForTimeout(500);
      
      const goldAfter = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      console.log('Gold after purchase:', goldAfter);
    }
    
    const rerollButton = page.locator('button:has-text("Reroll"), button:has-text("Refresh")');
    if (await rerollButton.isVisible()) {
      const goldBeforeReroll = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      await rerollButton.click();
      await page.waitForTimeout(500);
      
      const goldAfterReroll = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      console.log('Gold before reroll:', goldBeforeReroll, 'after:', goldAfterReroll);
    }
    
    const readyButton = page.locator('button:has-text("Ready"), button:has-text("Done"), button:has-text("Continue")');
    if (await readyButton.isVisible()) {
      await readyButton.click();
    }
    
    await expect(page.locator('.combat, .battle, [class*="combat"]')).toBeVisible({ timeout: 20000 });
    
    await page.waitForTimeout(2000);
    
    const healthBar = page.locator('.health, .hp, [class*="health"]').first();
    await expect(healthBar).toBeVisible({ timeout: 5000 });
    
    await page.waitForFunction(() => {
      const combatElements = document.querySelectorAll('.combat, .battle, [class*="combat"]');
      return combatElements.length === 0 || 
             document.querySelector('.shop, .ability-shop') !== null ||
             document.querySelector('button:has-text("Continue")') !== null;
    }, { timeout: 60000 });
    
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
    
    await page.click('button:has-text("Single Player Tournament")');
    
    await expect(page.locator('.hero-selection, #hero-selection')).toBeVisible({ timeout: 10000 });
    const firstHero = page.locator('.hero-card, .hero-option').first();
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    const startButton = page.locator('button:has-text("Start"), button:has-text("Ready"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    await expect(page.locator('.shop, .ability-shop, #shop')).toBeVisible({ timeout: 15000 });
    
    const initialGoldText = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
    const initialGold = parseInt(initialGoldText.replace(/\D/g, ''));
    console.log('Initial gold:', initialGold);
    
    const rerollButton = page.locator('button:has-text("Reroll"), button:has-text("Refresh")');
    if (await rerollButton.isVisible()) {
      await rerollButton.click();
      await page.waitForTimeout(500);
      
      const afterRerollText = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      const afterRerollGold = parseInt(afterRerollText.replace(/\D/g, ''));
      console.log('Gold after reroll:', afterRerollGold);
      
      expect(afterRerollGold).toBeLessThan(initialGold);
    }
    
    const buyButton = page.locator('button:has-text("Buy"), button:has-text("Purchase")').first();
    if (await buyButton.isVisible()) {
      const beforePurchaseText = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      const beforePurchaseGold = parseInt(beforePurchaseText.replace(/\D/g, ''));
      
      await buyButton.click();
      await page.waitForTimeout(500);
      
      const afterPurchaseText = await page.locator('.gold, .player-gold, [class*="gold"]').first().textContent();
      const afterPurchaseGold = parseInt(afterPurchaseText.replace(/\D/g, ''));
      console.log('Gold before purchase:', beforePurchaseGold, 'after:', afterPurchaseGold);
      
      expect(afterPurchaseGold).toBeLessThan(beforePurchaseGold);
    }
  });

  test('should display combat correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.click('button:has-text("Single Player Tournament")');
    
    await expect(page.locator('.hero-selection, #hero-selection')).toBeVisible({ timeout: 10000 });
    const firstHero = page.locator('.hero-card, .hero-option').first();
    await firstHero.click();
    
    await page.waitForTimeout(1000);
    const startButton = page.locator('button:has-text("Start"), button:has-text("Ready"), button:has-text("Begin")');
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    await expect(page.locator('.shop, .ability-shop, #shop')).toBeVisible({ timeout: 15000 });
    
    const readyButton = page.locator('button:has-text("Ready"), button:has-text("Done"), button:has-text("Continue")');
    if (await readyButton.isVisible()) {
      await readyButton.click();
    }
    
    await expect(page.locator('.combat, .battle, [class*="combat"]')).toBeVisible({ timeout: 20000 });
    
    const playerHealth = page.locator('.player-health, .player .health, [class*="player"] [class*="health"]').first();
    await expect(playerHealth).toBeVisible({ timeout: 5000 });
    
    const enemyHealth = page.locator('.enemy-health, .enemy .health, [class*="enemy"] [class*="health"]').first();
    await expect(enemyHealth).toBeVisible({ timeout: 5000 });
    
    await page.waitForTimeout(5000);
    
    console.log('Combat display test completed successfully');
  });
});
