import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';
import { exit } from 'process';

const keepTestData = process.env.KEEP_TEST_DATA === 'true' || process.env.KEEP_TEST_DATA === '1';

// Test for Kataloge > Vermerkarten

test.describe('Kataloge - Vermerkarten', () => {
  test('should login, navigate to Vermerkarten, and add data', async ({ page }) => {
    // Login using shared helper (now points to correct port)
    await loginAsAdmin(page);

    // Go to App Schule using robust selector
    await page.locator('a.sidebar--menu-item[title="Schule"]').click();

    // Click on Kataloge using robust selector
    await page.locator('tr.svws-ui-tr td.svws-ui-td[role="columnheader"]', { hasText: 'Kataloge' }).click();

    // Wait for the catalog submenu to appear
    await page.waitForTimeout(1000);

    // Click on Vermerkarten using the correct selector for sidebar menu item
    await page.locator('a.sidebar--menu-item[title="Vermerkarten"]').click();

    // Verify we're on the Vermerkarten page by checking for a specific element
    await page.waitForSelector('text=Vermerkarten', { timeout: 2000 });
    
    // Click the '+' button to add a new Vermerkkart
    await page.locator('button.button--icon:has(.icon.i-ri-add-line)').first().click();

    // Wait for observation
    await page.waitForTimeout(200);

    // Fill in the Bezeichnung field
    const bezeichnungInput = page.getByLabel('Bezeichnung (zwischen 1 und 30 Zeichen)');
    await bezeichnungInput.waitFor({ state: 'visible' });
    await bezeichnungInput.fill('Test Vermerkart');
    await bezeichnungInput.press('Tab');

    // Fill in the Sortierung field
    const sortierungInput = page.getByLabel('Sortierung');
    await sortierungInput.waitFor({ state: 'visible' });
    await sortierungInput.fill('20');
    await sortierungInput.press('Tab');

    // Click the "Speichern" button to save
    await page.locator('button:has-text("Speichern")').click();

    // Wait for observation
    await page.waitForTimeout(200);



    if (!keepTestData) {

        // Go to the checkbox after saving
        const postSaveCheckbox = page.locator('xpath=/html/body/div/div/div[3]/div[2]/div/div[3]/div/div[2]/div[2]/div[19]/div[1]/input');
        await postSaveCheckbox.check();

        // Click the "Löschen" button to delete
        await page.locator('button:has-text("Löschen")').first().click();

        // Click the confirmation "Löschen" button
        await page.locator('button:has-text("Löschen")').last().click();
    }

    // Wait for observation
    await page.waitForTimeout(0);
  });
});