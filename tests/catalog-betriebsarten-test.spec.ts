import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Kataloge > Betriebsarten

test.describe('Kataloge - Betriebsarten', () => {
  test('should login, navigate to Betriebsarten, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Betriebsarten using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Betriebsarten"]').click();

    // Verify we're on the Betriebsarten page by checking for a specific element
    await page.waitForSelector('text=Betriebsarten', { timeout: 100 });

    // Click the '+' button to add a new Betriebsart
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Fill in the Betriebsart name
    const nameInput = page.locator('input.text-input--control[type="text"][required]').first();
    await nameInput.fill('Testbetriebsart');
    await nameInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Go to the checkbox after saving
    const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[3]/div[1]/input');
    await postSaveCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

    // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(0);
  });
});