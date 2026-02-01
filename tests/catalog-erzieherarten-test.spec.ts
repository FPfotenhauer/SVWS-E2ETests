import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

// Test for Kataloge > Erzieherarten

test.describe('Kataloge - Erzieherarten', () => {
  test('should login, navigate to Erzieherarten, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Erzieherarten using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Erzieherarten"]').click();

    // Verify we're on the Erzieherarten page by checking for a specific element
    await page.waitForSelector('text=Erzieherarten', { timeout: 200 });

    // Click the '+' button to add a new Erzieherarten
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Fill in the Einwilligungsart Bezeichnung
    const bezeichnungInput = page.locator('label:has-text("Bezeichnung")').locator('input.text-input--control');
    await bezeichnungInput.fill('Erzieherart Test');
    await bezeichnungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Check the specific checkbox
    const specificCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[8]/div[1]/input');
    await specificCheckbox.check();

    // Click the "Löschen" button to delete
    await page.locator('button:has-text("Löschen")').first().click();

   // Click the confirmation "Löschen" button
    await page.locator('button:has-text("Löschen")').last().click();

    // Wait for observation
    await page.waitForTimeout(2000);
  });
});